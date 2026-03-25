const User = require('./models/User');

module.exports = (io) => {
  // Map: userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User comes online
    socket.on('user:online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

      // Broadcast to all: this user is online
      socket.broadcast.emit('user:status', { userId, isOnline: true });

      // Send current online list to newly connected user
      socket.emit('online:list', Array.from(onlineUsers.keys()));
    });

    // Real-time friend request
    socket.on('friend:request', ({ toUserId, from }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('friend:request:received', {
          from,
          message: `${from.username} sent you a friend request`
        });
      }
    });

    // Real-time friend accept
    socket.on('friend:accepted', ({ toUserId, by }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('friend:accepted:notify', {
          by,
          message: `${by.username} accepted your friend request`
        });
      }
    });

    // Real-time like notification
    socket.on('post:liked', ({ postAuthorId, likedBy, postId }) => {
      const authorSocket = onlineUsers.get(postAuthorId);
      if (authorSocket) {
        io.to(authorSocket).emit('notification:new', {
          type: 'like',
          message: `${likedBy} liked your post`,
          postId
        });
      }
    });

    // Real-time comment notification
    socket.on('post:commented', ({ postAuthorId, commentBy, postId }) => {
      const authorSocket = onlineUsers.get(postAuthorId);
      if (authorSocket) {
        io.to(authorSocket).emit('notification:new', {
          type: 'comment',
          message: `${commentBy} commented on your post`,
          postId
        });
      }
    });

    // User disconnects
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });
        socket.broadcast.emit('user:status', {
          userId: socket.userId,
          isOnline: false
        });
      }
    });
  });
};

git init
git add backend/package.json frontend/package.json .gitignore
git commit -m "chore: setup project workspace and dependencies"

git add backend/config backend/models
git commit -m "feat(backend): initialize database connection and data schemas"

git add backend/routes/auth.js backend/routes/users.js
git commit -m "feat(backend): implement user authentication and profiles"

git add backend/routes backend/socket.js
git commit -m "feat(backend): add post logic and socket.io real-time events"

git add backend/server.js
git commit -m "feat(backend): wire express server with websocket routing"

git add frontend/index.html frontend/vite.config.js frontend/src/api frontend/src/context
git commit -m "feat(frontend): setup vite entry and global state contexts"

git add frontend/src/pages frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat(frontend): configure routing and page shells"

git add frontend/src/components/AuthForm.jsx frontend/src/components/Navbar.jsx
git commit -m "feat(frontend): build auth portal and responsive navigation"

git add frontend/src/components/PostCard.jsx frontend/src/components/CreatePost.jsx frontend/src/components/PostFeed.jsx
git commit -m "feat(frontend): implement social feed and post creation"

git add frontend/src/components frontend/src/utils frontend/src/*.css
git commit -m "style: apply Nova premium aesthetics and glassmorphism UI"

git add .
git commit -m "chore: final polish and bug fixes"

git branch -M main
git remote add origin https://github.com/ABHINAVJINDAL26/buzzfeed-social.git
git push -u origin main --force

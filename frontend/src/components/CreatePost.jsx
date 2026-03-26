import { useState, useRef } from 'react';

const EMOJIS = ['😀', '😂', '🥰', '😎', '😭', '🥺', '✨', '🔥', '🎉', '👍', '❤️', '🙏', '🙌', '🤔', '👀'];

const CATEGORIES = [
  'Select Category',
  'Technology',
  'Fashion',
  'Health',
  'Finance',
  'Education',
  'Entertainment'
];

export default function CreatePost({ onCreatePost, creating }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'promotions'
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  // Toggles
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPoll, setShowPoll] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Promotion state
  const [promoData, setPromoData] = useState({
    appName: '',
    title: '',
    description: '',
    buttonText: '',
    category: '',
    link: ''
  });

  const fileInputRef = useRef(null);

  // Handlers
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      setError('');
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojis(false);
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePromoChange = (e) => {
    setPromoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid = () => {
    if (activeTab === 'promotions') {
      return (
        promoData.appName.trim() &&
        promoData.title.trim() &&
        promoData.description.trim() &&
        promoData.buttonText.trim() &&
        promoData.category.trim() &&
        promoData.category !== 'Select Category' &&
        promoData.link.trim()
      );
    }
    
    // Regular post
    const hasTextOrImage = text.trim() || imageUrl.trim();
    if (!hasTextOrImage && !showPoll) return false;
    
    // If poll is active, at least two options must have text
    if (showPoll) {
      const validOptions = pollOptions.filter((opt) => opt.trim()).length;
      if (validOptions < 2) return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid()) {
      setError('Please fill in required fields.');
      return;
    }

    setError('');

    const payload = {
      text: activeTab === 'promotions' ? promoData.description.trim() : text.trim(),
      imageUrl: imageUrl.trim(),
      pollOptions: activeTab === 'all' && showPoll 
        ? pollOptions.filter((o) => o.trim()).map(text => ({ text, voters: [] })) 
        : [],
      isPromotion: activeTab === 'promotions',
      promotionData: activeTab === 'promotions' ? { ...promoData } : null
    };

    const created = await onCreatePost(payload);

    if (created) {
      setText('');
      setImageUrl('');
      setShowPoll(false);
      setPollOptions(['', '']);
      setActiveTab('all');
      setPromoData({
        appName: '',
        title: '',
        description: '',
        buttonText: '',
        category: '',
        link: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section className="card create-post">
      <div className="flex-between">
        <h2 className="section-title">
          {activeTab === 'promotions' ? 'Create Promotion' : "What's on your mind?"}
        </h2>
        <div className="cp-tabs">
          <button
            type="button"
            className={`cp-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts
          </button>
          <button
            type="button"
            className={`cp-tab ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promotions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack create-post-form">
        {activeTab === 'all' ? (
          <>
            <textarea
              className="textarea"
              style={{ border: 'none', boxShadow: 'none', background: 'transparent', paddingLeft: 0, paddingRight: 0, fontSize: '1.1rem' }}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Share an update with your network..."
              maxLength={1000}
              rows={3}
            />

            {showPoll && (
              <div className="card" style={{ padding: '1rem', marginTop: '0.5rem', background: 'var(--surface-strong)', boxShadow: 'none' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Create Poll</h4>
                <div className="stack">
                  {pollOptions.map((opt, idx) => (
                    <div className="poll-option-row" key={idx}>
                      <input
                        type="text"
                        className="input poll-input"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                      />
                      {pollOptions.length > 2 && (
                        <button type="button" className="button-text" onClick={() => removePollOption(idx)}>✖</button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <button type="button" className="btn-add-option" onClick={addPollOption}>
                      + Add option
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {imageUrl && (
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <img src={imageUrl} alt="Upload preview" style={{ width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover' }} />
                <button type="button" onClick={() => setImageUrl('')} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>✖</button>
              </div>
            )}
          </>
        ) : (
          <div className="promotion-form-grid">
            <input
              type="text"
              name="appName"
              className="promo-input full-width"
              placeholder="App/Website Name (e.g. TaskPlanet)"
              value={promoData.appName}
              onChange={handlePromoChange}
            />
            <input
              type="text"
              name="title"
              className="promo-input full-width"
              placeholder="Promotion Title"
              value={promoData.title}
              onChange={handlePromoChange}
            />
            <textarea
              name="description"
              className="promo-input full-width"
              placeholder="Promotion Description..."
              rows={2}
              value={promoData.description}
              onChange={handlePromoChange}
            />
            <input
              type="text"
              name="buttonText"
              className="promo-input"
              placeholder="Button Text (e.g. Shop Now)"
              value={promoData.buttonText}
              onChange={handlePromoChange}
            />
            <select
              name="category"
              className="promo-input"
              value={promoData.category}
              onChange={handlePromoChange}
              style={{ color: promoData.category === '' ? 'var(--muted)' : 'inherit' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="url"
              name="link"
              className="promo-input full-width"
              placeholder="Button Link (https://...)"
              value={promoData.link}
              onChange={handlePromoChange}
            />
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileUpload}
        />

        <div className="post-tools">
          <div className="tool-icons post-tools-container">
            <button type="button" className="tool-btn icon-blue" title="Add Photo" onClick={() => fileInputRef.current?.click()}>
              📷
            </button>
            <button type="button" className="tool-btn icon-pink" title="Add Emoji" onClick={() => setShowEmojis(!showEmojis)}>
              😊
            </button>
            <button type="button" className="tool-btn icon-gray" title="Create Poll" onClick={() => setShowPoll(!showPoll)}>
              ☰
            </button>

            {showEmojis && (
              <div className="emoji-picker-popover">
                {EMOJIS.map((emoji) => (
                  <button type="button" key={emoji} className="emoji-btn" onClick={() => handleEmojiClick(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="post-tools-actions">
            <button
              type="button"
              className="tool-btn icon-action"
              title="Switch to Promote"
              onClick={() => setActiveTab('promotions')}
            >
              📢 Promote
            </button>

            <button
              disabled={creating || !isFormValid()}
              className="button button-primary compose-submit-btn"
              type="submit"
            >
              {creating ? 'Processing...' : activeTab === 'promotions' ? 'Promote' : 'Post'}
            </button>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}

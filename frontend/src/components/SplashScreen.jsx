import { useState, useEffect, useRef } from 'react';
import './SplashScreen.css';

/**
 * SplashScreen Component
 * Phase 1: Gradient Vibe (0-3s)
 * Phase 2: Cyberpunk Glitch (3s+)
 */
export default function SplashScreen({ onEnter }) {
  const [phase, setPhase] = useState('gradient'); // 'gradient' | 'glitch'
  const [exiting, setExiting] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Preload a premium ambient sound (Royalty Free)
    audioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a7315b.mp3');
    audioRef.current.volume = 0.4;
    audioRef.current.loop = true;

    // switch to glitch phase after 3 seconds
    const phaseTimer = setTimeout(() => {
      setPhase('glitch');
    }, 3000);

    // auto-dismiss after 7 seconds
    const autoTimer = setTimeout(() => {
      handleEnter();
    }, 7000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    
    // Attempt play on user interaction (Required by browsers)
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }

    setExiting(true);
    // Slight delay for exit animation before unmounting
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    if (audioRef.current) audioRef.current.pause();
    setExiting(true);
    setTimeout(() => {
      onEnter();
    }, 300);
  };

  return (
    <div 
      className={`splash-wrapper ${exiting ? 'exiting' : ''}`}
      onClick={handleEnter}
    >
      {/* PHASE 1: GRADIENT VIBE */}
      {phase === 'gradient' && (
        <div className="phase-wrap gradient-phase">
          <div className="splash-bg-gradient" />
          <div className="splash-overlay" />
          
          <div className="splash-content">
            <h1 className="gradient-logo">NOVA</h1>
            <p className="gradient-tagline">Connect · Share · Vibe</p>
            
            <div className="sound-wave">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="wave-bar" 
                  style={{ 
                    height: [12, 24, 32, 18, 28, 14, 22][i] + 'px',
                    animation: `waveBar ${[0.4, 0.5, 0.4, 0.6, 0.4, 0.5, 0.4][i]}s ${[0, 0.1, 0.2, 0.3, 0.1, 0.2, 0][i]}s infinite`
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: CYBERPUNK GLITCH */}
      {phase === 'glitch' && (
        <div className="phase-wrap glitch-phase">
          <div className="splash-bg-glitch" />
          <div className="scanlines" />
          
          <div className="splash-content">
            <h1 className="glitch-main" data-text="NOVA">NOVA</h1>
            <p className="glitch-subtitle">EST. 2026</p>
            <p className="tap-hint">Tap anywhere to enter</p>
          </div>
        </div>
      )}

      <button className="skip-btn" onClick={handleSkip}>
        Skip →
      </button>
    </div>
  );
}

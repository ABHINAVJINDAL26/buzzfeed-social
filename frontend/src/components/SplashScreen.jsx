import { useState, useEffect, useRef } from 'react';
import introSong from '../assets/audio/intro.mp3';
import './SplashScreen.css';

/**
 * SplashScreen Component
 * Sequence: Phase 1 (Gradient) -> Phase 2 (Glitch) -> App
 * 
 * Rules:
 * 1. Touching Gradient starts music and moves to Glitch.
 * 2. 10s auto-wait on Gradient moves to Glitch (silent).
 * 3. 5s auto-wait on Glitch moves to App (stops music).
 * 4. Touching Glitch moves to App (stops music).
 */
export default function SplashScreen({ onEnter }) {
  const [phase, setPhase] = useState('gradient'); // 'gradient' | 'glitch'
  const [exiting, setExiting] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Preload audio
    audioRef.current = new Audio(introSong);
    audioRef.current.volume = 0.5;
    audioRef.current.loop = true;

    // cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (phase === 'gradient') {
      // Auto switch to glitch after 10s if user does nothing
      timer = setTimeout(() => {
        setPhase('glitch');
      }, 10000);
    } else if (phase === 'glitch') {
      // Auto enter app after 5s on glitch
      timer = setTimeout(() => {
        handleEnter();
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  const handleEnter = () => {
    if (exiting) return;
    
    // Stop music immediately when transitioning to login/signup
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleSplashClick = () => {
    if (exiting) return;

    if (phase === 'gradient') {
      // Start music only if user touched it
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Audio blocked", e));
      }
      setPhase('glitch');
    } else {
      // In glitch phase, clicking enters the app
      handleEnter();
    }
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    handleEnter();
  };

  return (
    <div 
      className={`splash-wrapper ${exiting ? 'exiting' : ''}`}
      onClick={handleSplashClick}
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
            <p className="tap-hint" style={{ marginTop: '20px' }}>Tap to begin the journey</p>
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
            <p className="tap-hint">Synthesizing network connection...</p>
          </div>
        </div>
      )}

      <button className="skip-btn" onClick={handleSkip}>
        Skip →
      </button>
    </div>
  );
}

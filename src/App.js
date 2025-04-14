import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
// Import Confetti dynamically to reduce initial bundle size
const Confetti = lazy(() => import('react-confetti'));

// Pre-define image dimensions to prevent layout shifts
const images = [
  { src: 'https://picsum.photos/id/1011/250/250', width: 250, height: 250 },
  { src: 'https://picsum.photos/id/1015/250/250', width: 250, height: 250 },
  { src: 'https://picsum.photos/id/1016/250/250', width: 250, height: 250 },
  { src: 'https://picsum.photos/id/1025/250/250', width: 250, height: 250 },
  { src: 'https://picsum.photos/id/1035/250/250', width: 250, height: 250 }
];

function App() {
  const [step, setStep] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [loading, setLoading] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const audioRef = useRef(null);
  const heartRefs = useRef([]);
  const starRefs = useRef([]);
  const meteorRefs = useRef([]);
  const [meteorites, setMeteorites] = useState([]);

  // Handle window resize with debounce for better performance
  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Loading progress animation
  useEffect(() => {
    let interval;
    if (step === 1 && loading < 100) {
      interval = setInterval(() => {
        setLoading(prev => {
          const next = prev + Math.floor(Math.random() * 10) + 1;
          return next > 100 ? 100 : next;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [step, loading]);

  // Auto-advance when loading reaches 100%
  useEffect(() => {
    if (loading === 100) {
      const timer = setTimeout(() => setStep(2), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Memoized Galaxy Background component to prevent unnecessary re-renders
  const GalaxyBackground = useCallback(() => {
    return (
      <div className="galaxy-container">
        <div className="galaxy-arm"></div>
        <div className="galaxy-arm"></div>
        <div className="galaxy-arm"></div>
        <div className="galaxy-dust"></div>
        <div className="galaxy-dust"></div>
        <div className="galaxy-core"></div>
        <div className="nebula"></div>
        <div className="star-cluster"></div>
        <div className="star-cluster"></div>
        <div className="star-cluster"></div>
      </div>
    );
  }, []);

  useEffect(() => {
    if (step === 2) {
      // Start confetti immediately
      setConfetti(true);

      // Handle audio with user interaction requirement
      const playAudio = () => {
        if (audioRef.current) {
          // Create a promise to handle the play attempt
          const playPromise = audioRef.current.play();

          // Handle the promise to avoid the "play interrupted" error
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playing successfully");
              })
              .catch(error => {
                console.log("Autoplay prevented:", error);

                // Add a visual button to allow user to start audio manually
                const audioButton = document.createElement("button");
                audioButton.innerText = "🎵 Play Music";
                audioButton.className = "audio-button";
                audioButton.onclick = () => {
                  audioRef.current.play()
                    .then(() => audioButton.remove())
                    .catch(e => console.log("Still couldn't play audio:", e));
                };
                const mainContent = document.querySelector(".main-content");
                if (mainContent) {
                  mainContent.prepend(audioButton);
                }
              });
          }
        }
      };

      // Try to play the audio
      playAudio();

      // Start hearts after 6 seconds
      setTimeout(() => {
        setShowHearts(true);
      }, 6000);

      // Optimize for mobile: reduce number of meteorites on mobile
      const meteorCount = isMobile ? 6 : 15;

      // Initialize meteorites array - optimize for mobile with fewer and less complex animations
      const initialMeteorites = Array.from({ length: meteorCount }).map((_, i) => ({
        id: i,
        startX: Math.random() * windowDimensions.width,
        startY: Math.random() * (windowDimensions.height / 3),
        size: Math.random() * 2 + 1,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 15
      }));
      setMeteorites(initialMeteorites);
    }
  }, [step, windowDimensions, isMobile]);

  // Meteorite animation loop - reduce frequency on mobile
  useEffect(() => {
    if (step === 2) {
      const intervalTime = isMobile ? 6000 : 4000; // Longer interval for mobile

      const meteorInterval = setInterval(() => {
        setMeteorites(prevMeteorites => {
          return prevMeteorites.map(meteor => {
            // Reduce animation probability on mobile
            const animationProbability = isMobile ? 0.4 : 0.7;

            if (Math.random() > animationProbability) {
              return {
                ...meteor,
                startX: Math.random() * windowDimensions.width,
                startY: Math.random() * (windowDimensions.height / 3),
                size: Math.random() * 2 + 1,
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 5
              };
            }
            return meteor;
          });
        });
      }, intervalTime);

      return () => clearInterval(meteorInterval);
    }
  }, [step, windowDimensions, isMobile]);

  // Initialize stars in night sky - fewer on mobile
  useEffect(() => {
    if (step === 2) {
      starRefs.current.forEach((star, index) => {
        if (star) {
          const delay = Math.random() * 5;
          const duration = Math.random() * 3 + 2;
          const x = Math.random() * windowDimensions.width;
          const y = Math.random() * (windowDimensions.height / 3);
          const size = Math.random() * 3 + 1;

          star.style.left = `${x}px`;
          star.style.top = `${y}px`;
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.animationDelay = `${delay}s`;
          star.style.animationDuration = `${duration}s`;
        }
      });
    }
  }, [step, windowDimensions]);

  // Floating heart animation - optimize for mobile
  useEffect(() => {
    if (step === 2 && showHearts) {
      // Longer intervals on mobile
      const intervalTime = isMobile ? 1000 : 500;

      const interval = setInterval(() => {
        heartRefs.current.forEach(heart => {
          if (heart) {
            // Shorter animation duration on mobile
            const duration = isMobile ? Math.random() * 7 + 5 : Math.random() * 10 + 5;
            const startX = Math.random() * windowDimensions.width;

            heart.style.left = `${startX}px`;
            heart.style.animation = `float ${duration}s linear infinite`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
          }
        });
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [step, showHearts, windowDimensions.width, isMobile]);

  // Memoize image gallery to prevent re-renders
  const PhotoGallery = useCallback(() => {
    return (
      <motion.div
        className="gallery"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        {images.map((img, index) => (
          <motion.div
            key={index}
            className="hanging-frame"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: index % 2 === 0 ? 3 : -3,
            }}
            transition={{ delay: 1.3 + index * 0.2, duration: 0.7 }}
          >
            <div className="thread"></div>
            <div className="photo-frame" style={{
              // Reduce animation complexity on mobile
              animation: isMobile
                ? `swing ${Math.random() * 1 + 4}s ease-in-out alternate infinite`
                : `swing ${Math.random() * 2 + 3}s ease-in-out alternate infinite`,
              // Set the dimensions explicitly to prevent layout shifts
              width: isMobile ? '120px' : '180px',
              height: isMobile ? '120px' : '180px'
            }}>
              <div className="photo-tape"></div>
              <img
                src={img.src}
                alt={`Memory ${index + 1}`}
                width={img.width}
                height={img.height}
                loading="lazy" // Lazy load images for better performance
              />
              <div className="photo-border"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }, [isMobile]);

  return (
    <div className={`app ${step === 2 ? 'night-mode' : ''}`}>
      {step === 2 && <GalaxyBackground />}
      <audio
        ref={audioRef}
        src="https://www.bensound.com/bensound-music/bensound-sunny.mp3"
        preload="auto"
      />

      {/* Night sky stars - fewer on mobile */}
      {step === 2 && Array.from({ length: isMobile ? 25 : 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          ref={el => starRefs.current[i] = el}
          className="star"
        />
      ))}
      {isMobile && (
        <>
          <div className="simple-meteor meteor-1"></div>
          <div className="simple-meteor meteor-2"></div>
          <div className="simple-meteor meteor-3"></div>
        </>
      )}
      {/* Meteorites (Shooting Stars) */}
      {step === 2 && meteorites.map((meteor, i) => (
        <div
          key={`meteor-${meteor.id}`}
          ref={el => meteorRefs.current[i] = el}
          className="meteor-container"
          style={{
            left: `${meteor.startX}px`,
            top: `${meteor.startY}px`,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`
          }}
        >
          <div
            className="meteor"
            style={{
              width: `${meteor.size * 50}px`,
              height: `${meteor.size}px`
            }}
          ></div>
          <div className="meteor-trail"></div>
        </div>
      ))}

      {/* Twinkling overlay */}
      <div className="twinkle-overlay"></div>

      {/* Moon */}
      {step === 2 && (
        <div className="moon">
          <div className="moon-crater moon-crater1"></div>
          <div className="moon-crater moon-crater2"></div>
          <div className="moon-crater moon-crater3"></div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            className="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.7 }}
            key="intro"
          >
            <motion.h1
              className="typewriter magical-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Hey Gaurav... Someone special planned this just for you...
            </motion.h1>
            <motion.button
              onClick={() => setStep(1)}
              whileHover={{ scale: 1.1, backgroundColor: "#ff5e78" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 0.5 }}
              className="start-button"
            >
              Click to Continue
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            className="transition-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            key="transition"
          >
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="magical-text"
            >
              Loading your surprise... 🎁
            </motion.h2>

            <motion.div className="loader-container">
              <motion.div
                className="loader-fill"
                initial={{ width: 0 }}
                animate={{ width: `${loading}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
              <span className="loader-text">{loading}%</span>
            </motion.div>

            <motion.div
              className="emoji-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.7, repeat: Infinity, repeatDelay: 0.8 }}
            >
              🎂 🎉 🎈
            </motion.div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            className="main-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            key="main"
          >
            <motion.h1
              className="title magical-text"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              ✨ Happy Birthday Komuu! 🎂
            </motion.h1>

            <motion.p
              className="message glow-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              On this magical night, may your birthday be as bright as the stars above.
              Each moment filled with joy, every wish coming true, like a shooting star in the moonlight.
              Make a wish when you see a falling star, for this special day is all about you! 💫
            </motion.p>

            {/* Use the memoized photo gallery component */}
            <PhotoGallery />

            <motion.div
              className="footer magical-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.7 }}
            >
              Made with ❤️ by Gaurav
            </motion.div>

            {/* Fewer floating hearts on mobile */}
            {showHearts && Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
              <div
                key={i}
                ref={el => heartRefs.current[i] = el}
                className="floating-heart"
              >
                ❤️
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {confetti && (
        <Suspense fallback={null}>
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={step === 2 && !showHearts}
            numberOfPieces={isMobile ? 300 : 800} // Fewer pieces on mobile
            gravity={0.12}
            colors={['#ff5e78', '#ffb8c6', '#ffecd2', '#fcd5ce', '#fec89a', '#ffffff', '#d4f1f9']}
            confettiSource={{ x: 0, y: 0, w: windowDimensions.width, h: 0 }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
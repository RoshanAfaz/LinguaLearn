import React, { useEffect, useState } from 'react';

const BackgroundEffects = ({ variant = 'gradient' }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random stars for constellation effect
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        starArray.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          animationDelay: Math.random() * 3,
          size: Math.random() * 3 + 1
        });
      }
      setStars(starArray);
    };

    if (variant === 'constellation') {
      generateStars();
    }
  }, [variant]);

  const renderGradientBackground = () => (
    <div className="moving-background"></div>
  );

  const renderParticles = () => (
    <div className="particles">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="particle"></div>
      ))}
    </div>
  );

  const renderGeometricShapes = () => (
    <div className="geometric-bg">
      {[...Array(15)].map((_, i) => {
        const shapes = ['triangle', 'square', 'circle', 'hexagon'];
        const shape = shapes[i % shapes.length];
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 20;
        const animationDuration = 15 + Math.random() * 10;

        return (
          <div
            key={i}
            className={`geometric-shape ${shape}`}
            style={{
              left: `${left}%`,
              animationDelay: `${animationDelay}s`,
              animationDuration: `${animationDuration}s`
            }}
          ></div>
        );
      })}
    </div>
  );

  const renderWaves = () => (
    <div className="wave-bg">
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </div>
  );

  const renderConstellation = () => (
    <div className="constellation">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.animationDelay}s`,
            width: `${star.size}px`,
            height: `${star.size}px`
          }}
        ></div>
      ))}
    </div>
  );

  const renderMinimalFloatingElements = () => (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Minimal floating shapes */}
      <div className="absolute top-32 right-40 w-4 h-4 bg-blue-200 opacity-10 rounded-full float"></div>
      <div className="absolute bottom-60 left-40 w-3 h-3 bg-purple-200 opacity-10 transform rotate-45 float-delayed"></div>
      <div className="absolute top-96 left-1/4 w-5 h-5 bg-pink-200 opacity-10 rounded-full animate-pulse-slow"></div>
    </div>
  );

  const renderBubbles = () => (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-5 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        ></div>
      ))}
    </div>
  );

  switch (variant) {
    case 'gradient':
      return renderGradientBackground();
    case 'particles':
      return (
        <>
          {renderGradientBackground()}
          {renderParticles()}
        </>
      );
    case 'geometric':
      return (
        <>
          {renderGradientBackground()}
          {renderGeometricShapes()}
        </>
      );
    case 'waves':
      return (
        <>
          {renderGradientBackground()}
          {renderWaves()}
        </>
      );
    case 'constellation':
      return (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-[-1]"></div>
          {renderConstellation()}
        </>
      );
    case 'bubbles':
      return (
        <>
          {renderGradientBackground()}
          {renderBubbles()}
        </>
      );
    case 'minimal':
      return renderMinimalFloatingElements();
    default:
      return (
        <>
          {renderGradientBackground()}
          {renderParticles()}
        </>
      );
  }
};

export default BackgroundEffects;

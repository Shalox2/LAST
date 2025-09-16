import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('pink');

  useEffect(() => {
    // Check for saved theme preference or default to 'pink'
    const savedTheme = localStorage.getItem('theme') || 'pink';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'pink' ? 'blue' : 'pink';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="header__link hover-glow tooltip"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      title={`Switch to ${theme === 'pink' ? 'blue' : 'pink'} theme`}
    >
      <span className="text-xl animate-pulse" aria-hidden="true">
        {theme === 'pink' ? '🩷' : '🟦'}
      </span>
      <span className="sr-only">
        {theme === 'pink' ? 'Switch to Blue Theme' : 'Switch to Pink Theme'}
      </span>
      <div className="tooltip__content">
        {theme === 'pink' ? 'Switch to Blue Theme' : 'Switch to Pink Theme'}
      </div>
    </button>
  );
};

export default ThemeToggle;

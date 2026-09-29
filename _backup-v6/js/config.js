tailwind.config = {
  theme: {
    extend: {
      colors: {
        canvas: '#faf7f0',
        surface: '#faf7f0',
        sand: '#f3eee2',
        line: '#e8e1d0',
        'on-surface': '#1f2421',
        'on-variant': '#4a524d',
        muted: '#62675f',
        primary: '#0f3d2e',
        'primary-deep': '#07241b',
        'primary-mid': '#185a43',
        'primary-light': '#2f7a5c',
        'primary-soft': '#b9c9bf',
        'on-primary': '#ffffff',
        gold: '#c9a227',
        'gold-light': '#e6c869',
        'gold-bright': '#d4af37',
        'gold-deep': '#7a5c0e',
        champagne: '#f1e3b5',
        'gold-tint': '#f6efd9',
        urgent: '#9b1c1c',
        'urgent-dark': '#7f1d1d',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"El Messiri"', '"IBM Plex Sans Arabic"', 'serif'],
      },
      maxWidth: { page: '1280px' },
      boxShadow: {
        card: '0 1px 2px rgba(31,36,33,.04), 0 10px 30px -14px rgba(16,48,36,.16)',
        lift: '0 28px 56px -22px rgba(16,48,36,.32), 0 8px 18px -8px rgba(16,48,36,.10)',
        glow: '0 16px 36px -12px rgba(201,162,39,.55)',
      },
    },
  },
};

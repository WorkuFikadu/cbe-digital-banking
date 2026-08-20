import React from 'react';

const CBELogo = ({ size = 42, showText = true, textColor = 'var(--text-primary)' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 10px rgba(88,28,135,0.4))' }}>
      {/* CBE Outer Gold & Purple Shield */}
      <rect x="6" y="6" width="108" height="108" rx="28" fill="#581c87" stroke="#f59e0b" strokeWidth="4" />
      {/* Inner Golden Hexagon Monogram */}
      <path d="M60 22 L90 38 L90 82 L60 98 L30 82 L30 38 Z" fill="#3b0764" stroke="#fbbf24" strokeWidth="3" />
      {/* CBE Key & Emblem */}
      <circle cx="60" cy="50" r="18" fill="none" stroke="#fbbf24" strokeWidth="4" />
      <path d="M60 38 L60 62 M48 50 L72 50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 74 C50 68, 70 68, 78 74" stroke="#fbbf24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <text x="60" y="93" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="2">CBE</text>
    </svg>
    {showText && (
      <div>
        <div style={{ fontWeight: '800', fontSize: Math.max(14, size * 0.40) + 'px', color: textColor, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          የኢትዮጵያ ንግድ ባንክ
        </div>
        <div style={{ fontSize: Math.max(9, size * 0.22) + 'px', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.04em', marginTop: '2px' }}>
          COMMERCIAL BANK OF ETHIOPIA
        </div>
      </div>
    )}
  </div>
);

export default CBELogo;

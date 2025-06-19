import React from 'react';
import Link from 'next/link';

interface NotificationBarProps {
  onClose: () => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  onClose,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff7f7f',
        color: 'white',
        padding: '16px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <span style={{ flex: 1 }}>
          Polls can be shared to Farcaster as Frame now! In alpha, only top 4
          options can be displayed and please choose only 1 credential.
        </span>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '12px',
          }}
          aria-label="Close notification"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

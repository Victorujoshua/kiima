'use client';

import { useEffect } from 'react';
import type { Notification } from '@/types';

const TYPE_ICON: Record<string, string> = {
  gift_received:     '🥤',
  pool_contribution: '🎯',
  pool_goal_reached: '🎉',
};

interface Props {
  notification: Notification;
  onDismiss: () => void;
}

export default function NotificationToast({ notification, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="k-notif-toast" style={toastStyle}>
      <span style={{ fontSize: '22px', flexShrink: 0 }}>
        {TYPE_ICON[notification.type] ?? '🔔'}
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={titleStyle}>{notification.title}</p>
        <p style={bodyStyle}>{notification.body}</p>
      </div>
      <button onClick={onDismiss} style={closeBtnStyle} aria-label="Dismiss">✕</button>
    </div>
  );
}

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  padding: '14px 18px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  zIndex: 9999,
  maxWidth: '320px',
  width: 'calc(100vw - 40px)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '14px',
  color: '#1C1916',
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: '#5A4D44',
  margin: '2px 0 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9A9089',
  fontSize: '14px',
  padding: '0 0 0 4px',
  flexShrink: 0,
  lineHeight: 1,
};

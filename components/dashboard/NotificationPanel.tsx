'use client';

import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import type { Notification } from '@/types';

const TYPE_ICON: Record<string, string> = {
  gift_received:     '🥤',
  pool_contribution: '🎯',
  pool_goal_reached: '🎉',
};

const TYPE_ICON_BG: Record<string, string> = {
  gift_received:     '#FDF1EC',
  pool_contribution: '#EEF1FD',
  pool_goal_reached: '#F0FDEE',
};

const TYPE_ROUTE: Record<string, string> = {
  gift_received:     '/dashboard/transactions',
  pool_contribution: '/dashboard/pools',
  pool_goal_reached: '/dashboard/pools',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

interface Props {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: Props) {
  const router = useRouter();

  function handleItemClick(n: Notification) {
    if (!n.is_read) onMarkAsRead(n.id);
    router.push(TYPE_ROUTE[n.type] ?? '/dashboard');
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={headerTitleStyle}>Notifications</span>
        <button
          onClick={onMarkAllAsRead}
          style={headerIconBtnStyle}
          aria-label="Mark all as read"
          title="Mark all as read"
        >
          <SlidersHorizontal size={16} strokeWidth={2} color="#9A9089" />
        </button>
      </div>
      <div style={dividerStyle} />

      {/* List */}
      <div style={{ overflowY: 'auto', maxHeight: '360px' }}>
        {notifications.length === 0 ? (
          <div style={emptyStyle}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>😴</span>
            <p style={emptyTitleStyle}>No notifications yet</p>
            <p style={emptyBodyStyle}>You&apos;ll get notified when someone supports you.</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              style={{
                ...itemStyle,
                background: n.is_read ? '#ffffff' : '#FAFAF8',
                borderBottom: i < notifications.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <div style={{ ...iconCircleStyle, background: TYPE_ICON_BG[n.type] ?? '#F5F5F5' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={itemTitleStyle}>{n.title}</p>
                <p style={itemBodyStyle}>{n.body}</p>
                <p style={itemTimeStyle}>{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span style={unreadDotStyle} />}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {unreadCount > 0 && (
        <>
          <div style={dividerStyle} />
          <div style={footerStyle}>
            <button onClick={onMarkAllAsRead} style={markAllBtnStyle}>
              Mark all as read
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '48px',
  width: '380px',
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  zIndex: 50,
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 18px 14px',
};

const headerTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '16px',
  color: '#1C1916',
};

const headerIconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '6px',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: '#F0F0F0',
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '14px 18px',
  cursor: 'pointer',
  transition: 'background 0.12s ease',
};

const iconCircleStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const itemTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '14px',
  color: '#1C1916',
  margin: 0,
};

const itemBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: '#5A4D44',
  margin: '3px 0 0',
  lineHeight: 1.5,
};

const itemTimeStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  color: '#B5AAAA',
  margin: '4px 0 0',
};

const unreadDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#D7D744',
  flexShrink: 0,
  alignSelf: 'center',
  marginLeft: '4px',
};

const emptyStyle: React.CSSProperties = {
  padding: '40px 24px',
  textAlign: 'center',
};

const emptyTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '15px',
  color: '#1C1916',
  margin: 0,
};

const emptyBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: '#9A9089',
  margin: '6px 0 0',
  lineHeight: 1.5,
};

const footerStyle: React.CSSProperties = {
  padding: '12px 18px',
  textAlign: 'center',
};

const markAllBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--kiima-orange)',
  padding: '4px 8px',
};

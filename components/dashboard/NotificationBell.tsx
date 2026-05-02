'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { markAsRead, markAllAsRead } from '@/lib/actions/notification.actions';
import NotificationPanel from './NotificationPanel';
import NotificationToast from './NotificationToast';
import type { Notification } from '@/types';

interface Props {
  userId: string;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export default function NotificationBell({ userId, initialNotifications, initialUnreadCount }: Props) {
  const [isOpen, setIsOpen]             = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount]   = useState(initialUnreadCount);
  const [toast, setToast]               = useState<Notification | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen]);

  // ── Real-time subscription ───────────────────────────────────────────────
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          setToast(newNotif);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await markAsRead(id, userId);
  }, [userId]);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await markAllAsRead(userId);
  }, [userId]);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={bellBtnStyle}
        aria-label="Open notifications"
      >
        <Bell size={18} color="#1C1916" strokeWidth={2} />
        {unreadCount > 0 && (
          <span style={badgeStyle}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}

      {/* Slide-in toast for real-time arrivals */}
      {toast && (
        <NotificationToast notification={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const bellBtnStyle: React.CSSProperties = {
  position: 'relative',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'box-shadow 0.15s ease',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '5px',
  right: '5px',
  minWidth: '8px',
  height: '8px',
  background: '#E85B5B',
  borderRadius: '50%',
  border: '1.5px solid #F4F4F4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '9px',
  color: '#ffffff',
  lineHeight: 1,
  padding: '0 2px',
};

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, formatTimeAgo } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    activeToast,
    markAsRead,
    markAllAsRead,
    dismissToast,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    } else if (item.project_id) {
      navigate(`/projects/${item.project_id}`);
    }
  };

  const handleToastClick = () => {
    if (!activeToast) return;
    if (!activeToast.is_read) {
      markAsRead(activeToast.id);
    }
    const targetLink = activeToast.link || (activeToast.project_id ? `/projects/${activeToast.project_id}` : null);
    dismissToast();
    if (targetLink) {
      navigate(targetLink);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_accepted':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        );
      case 'collaboration_request':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </span>
        );
      case 'request_rejected':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
        );
    }
  };

  return (
    <>
      {/* Real-time Toast Banner Popup */}
      {activeToast && (
        <div
          className="fixed top-5 right-5 z-50 flex max-w-sm cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl transition-all animate-in slide-in-from-top-4 duration-300 hover:border-neutral-300"
          onClick={handleToastClick}
        >
          {getNotificationIcon(activeToast.type)}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-neutral-900">{activeToast.title}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast();
                }}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">{activeToast.message}</p>
            <p className="mt-2 text-[10px] font-semibold text-lime-700">Click to view project →</p>
          </div>
        </div>
      )}

      {/* Bell Button & Dropdown Popover */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Notifications"
          aria-expanded={isOpen}
          className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            isOpen ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
          }`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 bg-neutral-50/70">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-lime-700 hover:text-lime-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
              {!user ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-sm font-medium text-neutral-700">Sign in to view notifications</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Receive collaboration requests and instant updates on your projects.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="mt-3 inline-flex items-center rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    Sign in
                  </button>
                </div>
              ) : loading && notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-neutral-800">No notifications yet</p>
                  <p className="mt-1 text-xs text-neutral-500 max-w-xs mx-auto">
                    When teammates send collaboration requests or accept your requests, they will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-neutral-50 ${
                      !item.is_read ? 'bg-lime-50/30' : 'bg-white'
                    }`}
                  >
                    {getNotificationIcon(item.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            item.type === 'request_accepted'
                              ? 'text-emerald-900 font-bold'
                              : 'text-neutral-900'
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-neutral-600 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between">
                        {item.project_title && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 truncate max-w-[180px]">
                            {item.project_title}
                          </span>
                        )}

                        {!item.is_read && (
                          <span className="h-2 w-2 rounded-full bg-lime-500 shrink-0 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {user && notifications.length > 0 && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-center">
                <span className="text-[11px] font-medium text-neutral-500">
                  Showing recent notifications
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

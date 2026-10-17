
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  ContactRound,
  CalendarClock,
  UserRoundCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Command,
  CheckCheck,
  Clock,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/clients', label: 'Clients', icon: ContactRound },
  { to: '/followups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/employees', label: 'Employees', icon: UserRoundCog, admin: true }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(false);
  const notificationRef = useRef(null);
  const nav = useNavigate();

  const signout = async () => {
    await logout();
    nav('/login');
  };

  const notifications = [
    {
      id: 1,
      title: 'Welcome to Northstar CRM',
      message: 'Your workspace is ready to use.',
      time: 'Workspace update',
      icon: CheckCircle2,
      color: 'success'
    },
    {
      id: 2,
      title: 'Manage your leads',
      message: 'Review your leads and keep their details updated.',
      time: 'CRM reminder',
      icon: UserPlus,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Follow-up reminder',
      message: 'Check your follow-up schedule for upcoming tasks.',
      time: 'Stay organized',
      icon: Clock,
      color: 'amber'
    }
  ];

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={21} />
          </div>
          <div>
            <strong>northstar<span>.</span></strong>
            <small>CRM WORKSPACE</small>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-pill">
          <div className="workspace-avatar">N</div>
          <div>
            <b>Northstar Studio</b>
            <small>Business workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {links
            .filter((link) => !link.admin || user?.role === 'ADMIN')
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                end={to === '/'}
                to={to}
                onClick={() => setMobile(false)}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === 'Leads' && (
                  <span className="nav-mini">CRM</span>
                )}
              </NavLink>
            ))}
        </nav>

        <div className="nav-label tools-label">PERSONAL</div>

        <NavLink
          to="/profile"
          onClick={() => setMobile(false)}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={18} />
          <span>My profile</span>
        </NavLink>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <b>Need a hand?</b>
            <p>Keep your customer relationships moving forward.</p>
            <a href="mailto:support@example.com">Contact support ↗</a>
          </div>

          <div className="user-mini">
            <div className="avatar">
              {user?.full_name?.slice(0, 1) || 'U'}
            </div>
            <div className="user-mini-info">
              <b>{user?.full_name || 'User'}</b>
              <small>
                {user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}
              </small>
            </div>
            <button
              title="Log out"
              aria-label="Log out"
              className="icon-button"
              onClick={signout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {mobile && (
        <div
          className="mobile-overlay"
          onClick={() => setMobile(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="crumb">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <b>Customer relationships</b>
          </div>

          <div className="topbar-right">
            <div className="live-chip">
              <span /> All systems operational
            </div>

            <div className="notification-wrapper" ref={notificationRef}>
              <button
                type="button"
                className="notification icon-button"
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={19} />
                {!readNotifications && <i />}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <div>
                      <h3>Notifications</h3>
                      <p>
                        {readNotifications
                          ? 'You are all caught up'
                          : `${notifications.length} updates for you`}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="notification-read-button"
                      onClick={() => setReadNotifications(true)}
                    >
                      <CheckCheck size={15} />
                      Mark all read
                    </button>
                  </div>

                  <div className="notification-list">
                    {notifications.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          className={`notification-item ${
                            readNotifications ? 'is-read' : 'is-unread'
                          }`}
                          key={item.id}
                        >
                          <div
                            className={`notification-item-icon ${item.color}`}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="notification-item-content">
                            <b>{item.title}</b>
                            <p>{item.message}</p>
                            <small>{item.time}</small>
                          </div>

                          {!readNotifications && (
                            <span className="notification-unread-dot" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="notification-footer">
                    Notifications for your workspace
                  </div>
                </div>
              )}
            </div>

            <div className="top-user">
              <div className="avatar avatar-sm">
                {user?.full_name?.slice(0, 1) || 'U'}
              </div>
              <div>
                <b>{user?.full_name}</b>
                <small>
                  {user?.role === 'ADMIN' ? 'Admin' : 'Team member'}
                </small>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>

        <footer className="app-footer">
          <span>© 2026 Northstar CRM</span>
          <span>
            Built for better relationships{' '}
            <span className="footer-heart">✦</span>
          </span>
        </footer>
      </main>
    </div>
  );
}

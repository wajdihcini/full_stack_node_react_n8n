/**
 * Layout — Main app shell with dark sidebar (250px), toggle button, top header.
 * Protected routes render inside <Outlet />.
 */
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  MessageSquare,
  Upload,
  LogOut,
  Bot,
  Menu,
  X,
} from 'lucide-react';

export default function Layout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: '/chatbot', icon: MessageSquare, label: 'Chatbot' },
    { to: '/upload', icon: Upload, label: 'Upload' },
  ];

  return (
    <div className="d-flex">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={`app-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <Bot size={22} />
          <span>AI Assistant</span>
        </div>

        {/* Navigation */}
        <ul className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li className="nav-item" key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="sidebar-logout">
          <button
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
            id="logout-button"
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────────── */}
      <div className={`app-main ${!sidebarOpen ? 'expanded' : ''}`}>
        {/* Top Header */}
        <header className="app-header">
          <button
            className="btn btn-link text-dark p-1 me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h6 className="mb-0 fw-bold">Dashboard</h6>
        </header>

        {/* Content */}
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

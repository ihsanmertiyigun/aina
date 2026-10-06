import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, ChevronDown, FileBarChart, LayoutDashboard, LogOut, Menu, Network,
  Search, Server, Settings, Workflow,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const NAV = [
  { group: "İzleme", items: [
    { to: "/", label: "Genel Bakış", icon: LayoutDashboard, end: true },
    { to: "/devices", label: "Cihazlar", icon: Server },
    { to: "/alerts", label: "Alarmlar", icon: Bell },
    { to: "/topology", label: "Topoloji", icon: Network },
  ]},
  { group: "Analiz", items: [
    { to: "/reports", label: "Raporlar", icon: FileBarChart },
    { to: "/automation", label: "Otomasyon", icon: Workflow },
  ]},
  { group: "Sistem", items: [
    { to: "/settings", label: "Ayarlar", icon: Settings },
  ]},
];

const TITLES = { "/": "Genel Bakış", "/devices": "Cihaz Envanteri", "/alerts": "Alarm Yönetimi",
  "/topology": "Topoloji", "/reports": "Raporlar", "/automation": "Otomasyon", "/settings": "Ayarlar" };

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const title = TITLES[pathname] || (pathname.startsWith("/devices/") ? "Cihaz Detayı" : "");
  const initials = (user?.full_name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={`shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <Logo size={34} variant="dark" />
        </div>
        <nav>
          {NAV.map((g) => (
            <div key={g.group} className="nav-group">
              <div className="nav-group-label">{g.group}</div>
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className="nav-item" title={label}>
                  <Icon size={18} /><span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer"><span className="dot up" /> <span>Tüm toplayıcılar aktif</span></div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Menü"><Menu size={18} /></button>
          <div className="crumbs"><span>AINA Portal</span><span className="sep">/</span><strong>{title}</strong></div>
          <div className="topbar-search"><Search size={15} /><input placeholder="Cihaz, IP veya alarm ara…" /></div>
          <button className="icon-btn" onClick={() => navigate("/alerts")} aria-label="Alarmlar"><Bell size={18} /></button>
          <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="avatar">{initials}</div>
            <div className="user-meta"><strong>{user?.full_name}</strong><span>{user?.is_staff ? "Yönetici" : "Operatör"}</span></div>
            <ChevronDown size={15} />
            {menuOpen && (
              <div className="dropdown">
                <button onClick={() => { logout(); navigate("/login"); }}><LogOut size={15} /> Çıkış Yap</button>
              </div>
            )}
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}

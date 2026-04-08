import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Gavel, Users, UserPlus, LayoutDashboard } from "lucide-react";

const navItems = [
  { path: "/config", label: "Config", icon: Gavel },
  { path: "/teams", label: "Teams", icon: Users },
  { path: "/auction", label: "Auction", icon: UserPlus },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007AFF] flex items-center justify-center">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                  CRICKET AUCTION
                </h1>
                <p className="text-xs text-[#A3A3A3] tracking-widest uppercase">Management System</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`
                      flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wider uppercase
                      transition-all duration-200 border-b-2
                      ${isActive 
                        ? "text-[#007AFF] border-[#007AFF]" 
                        : "text-[#A3A3A3] border-transparent hover:text-white hover:bg-white/5"
                      }
                    `}
                    style={{ fontFamily: 'Barlow Condensed' }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

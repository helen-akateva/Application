import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { List, Calendar, Plus, LogOut, Menu, X, Bot } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { logoutUser } from "../api/auth";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      logout();
      navigate("/login");
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 py-3">
        {/* Desktop Menu - hidden on mobile */}
        <div className="hidden items-center gap-4 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            <List className="h-4 w-4" />
            Events
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/my-events" className={navLinkClass}>
              <Calendar className="h-4 w-4" />
              My Events
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/ai-assistant" className={navLinkClass}>
              <Bot className="h-4 w-4" />
              AI Assistant
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink
              to="/create-event"
              className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </NavLink>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="max-w-[120px] truncate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 transition-colors hover:text-gray-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>

        {/* Burger button - only for mobile */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu - under the navbar */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              className={mobileNavLinkClass}
              onClick={closeMenu}
            >
              <List className="h-4 w-4" />
              Events
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-events"
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                <Calendar className="h-4 w-4" />
                My Events
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/ai-assistant"
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                <Bot className="h-4 w-4" />
                AI Assistant
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/create-event"
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                <Plus className="h-4 w-4" />
                Create Event
              </NavLink>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            {isAuthenticated && user ? (
              <>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={mobileNavLinkClass}
                  onClick={closeMenu}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

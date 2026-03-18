import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/authSlice"; // adjust path if needed

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Left: Logo */}
          <div className="flex items-center">
            <span className="text-white font-bold text-[2rem] tracking-tight">
              <Link to="/">
                C<span className="text-[1rem]">ode</span>V<span className="text-[1rem]">ault</span>
              </Link>
            </span>
          </div>

          {/* Right: Desktop Nav + Auth */}
          <div className="flex items-center gap-5">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/tasks"
                className="text-white hover:text-zinc-300 px-4 py-2 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm"
              >
                Task
              </Link>
              <Link
                to="/folders"
                className="text-white hover:text-zinc-300 px-4 py-2 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm"
              >
                Folders
              </Link>
               <Link
                to="/playground"
                className="text-white hover:text-zinc-300 px-4 py-2 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm"
              >
                PlayGround
              </Link>
            </nav>

            {/* Auth: Profile dropdown OR Sign Up */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border-2 border-zinc-700 hover:border-zinc-400 transition duration-200 focus:outline-none"
                >
                  {/* Avatar circle with initials */}
                  <div className="w-7 h-7 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center select-none">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-zinc-500 text-xs truncate">{user?.email}</p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        View Profile
                      </Link>
                      {/* <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        Dashboard
                      </Link> */}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-zinc-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signup"
                className="hidden sm:inline-flex px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition duration-200 text-sm"
              >
                Sign Up
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="flex flex-col gap-2 px-4 pb-4 pt-2 border-t border-zinc-800 bg-black/95">
          <Link
            to="/tasks"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-zinc-300 px-4 py-2.5 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm text-center"
          >
            Task
          </Link>
          <Link
            to="/folders"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-zinc-300 px-4 py-2.5 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm text-center"
          >
            Folders
          </Link>

          <Link
                to="/playground"
                className="text-white hover:text-zinc-300 px-4 py-2 rounded-full border-2 border-white hover:border-zinc-300 transition duration-200 text-sm"
              >
                PlayGround
              </Link>

          {isAuthenticated ? (
            <>
              {/* Mobile user info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="w-8 h-8 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-zinc-500 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="text-zinc-300 hover:text-white px-4 py-2.5 rounded-full border-2 border-zinc-700 hover:border-zinc-400 transition duration-200 text-sm text-center"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full border-2 border-red-800 text-red-400 hover:bg-red-900/30 transition duration-200 text-sm text-center"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition duration-200 text-sm text-center"
            >
              Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
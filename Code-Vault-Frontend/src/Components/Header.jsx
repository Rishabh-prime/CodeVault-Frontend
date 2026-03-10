import { useState } from "react";

// Simulating Link for demo purposes
const Link = ({ to, className, children, onClick }) => (
  <a href={to} className={className} onClick={onClick}>
    {children}
  </a>
);

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Right: Desktop Nav + Sign Up */}
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
            </nav>

            <Link
              to="/signup"
              className="hidden sm:inline-flex px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition duration-200 text-sm"
            >
              Sign Up
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
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
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition duration-200 text-sm text-center"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-black border-t border-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Link to="/" className="text-white font-bold text-[2rem] tracking-tight leading-none">
              C<span className="text-[1rem]">ode</span>V<span className="text-[1rem]">ault</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your personal vault for code snippets, tasks, and folders. Stay organized, ship faster.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-10 sm:gap-16">

            {/* Product */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Product</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/folders"    className="text-zinc-300 hover:text-white text-sm transition duration-200">Folders</Link>
                <Link to="/tasks"      className="text-zinc-300 hover:text-white text-sm transition duration-200">Tasks</Link>
                <Link to="/playground" className="text-zinc-300 hover:text-white text-sm transition duration-200">Playground</Link>
              </nav>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Account</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/signup"  className="text-zinc-300 hover:text-white text-sm transition duration-200">Sign Up</Link>
                <Link to="/login"   className="text-zinc-300 hover:text-white text-sm transition duration-200">Log In</Link>
                <Link to="/profile" className="text-zinc-300 hover:text-white text-sm transition duration-200">Profile</Link>
              </nav>
            </div>

          </div>
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex items-center justify-center">
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} CodeVault. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
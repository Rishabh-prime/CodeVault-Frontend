import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FULL_TEXT = "Code Vault";
const TYPEWRITER_SPEED = 100; // ms per character
const CURSOR_BLINK_DONE = true; // keep cursor blinking after done

function Hero() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (displayed.length < FULL_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayed(FULL_TEXT.slice(0, displayed.length + 1));
      }, TYPEWRITER_SPEED);
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
    }
  }, [displayed]);

  return (
    <section className="min-h-[88vh] bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Soft radial glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, white 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6">

        {/* Typewriter heading */}
        <h1 className="text-white font-bold tracking-tight leading-none select-none"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
        >
          {displayed}
          {/* <span
            className={`inline-block w-[3px] ml-1 align-middle bg-white ${done ? "animate-pulse" : ""}`}
            style={{ height: "0.85em", verticalAlign: "middle" }}
          /> */}
          {done && (
            <span
              className="ml-3 inline-block transition-all duration-500"
              style={{ fontSize: "0.75em", verticalAlign: "middle", animation: "bearPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
              🐼
            </span>
          )}
          <style>{`
            @keyframes bearPop {
              from { opacity: 0; transform: scale(0.3) rotate(-15deg); }
              to   { opacity: 1; transform: scale(1) rotate(0deg); }
            }
          `}</style>
        </h1>

        {/* Subtitle — fades in after typewriter is done */}
        <p
          className="text-zinc-400 text-lg md:text-xl tracking-wide transition-all duration-700"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? "translateY(0)" : "translateY(8px)",
            fontFamily: "'Georgia', serif",
            letterSpacing: "0.08em",
          }}
        >
          Manage yourself.
        </p>

        {/* CTA buttons — also fade in after typewriter */}
        <div
          className="flex items-center gap-4 mt-4 transition-all duration-700 delay-150"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <Link
            to="/signup"
            className="px-7 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition duration-200 text-sm tracking-wide"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-7 py-3 border-2 border-zinc-700 text-zinc-300 font-medium rounded-full hover:border-zinc-400 hover:text-white transition duration-200 text-sm tracking-wide"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}

export default Hero;
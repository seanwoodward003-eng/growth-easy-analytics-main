import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-[#00ffff] mb-12 animate-glitch">
          SIGN UP
        </h1>

        <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-12">
          <h2 className="text-4xl text-cyan-300 mb-8">
            Start Your 7-Day Free Trial
          </h2>
          <p className="text-xl text-cyan-200 mb-12">
            No credit card required • Full access • Real AI insights
          </p>

          <form className="space-y-8">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-2xl text-cyan-100 placeholder-cyan-500 focus:outline-none focus:border-cyan-300 transition"
              required
            />
            <input
              type="password"
              placeholder="Choose a password"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-2xl text-cyan-100 placeholder-cyan-500 focus:outline-none focus:border-cyan-300 transition"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#00ffff] text-black py-6 rounded-full text-3xl font-bold hover:scale-105 transition shadow-2xl shadow-[#00ffff]/50"
            >
              Create Account
            </button>
          </form>

          <p className="text-cyan-400 mt-10 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00ffff] underline hover:no-underline">
              Log in here
            </Link>
          </p>
        </div>

        <p className="text-cyan-500 mt-12 text-sm">
          Beta v0.1 © 2025 GrowthEasy AI
        </p>
      </div>
    </main>
  );
}
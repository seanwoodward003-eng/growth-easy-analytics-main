import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-[#00ffff] mb-12 animate-glitch">
          LOG IN
        </h1>

        <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-12">
          <form className="space-y-8">
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-2xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-2xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#00ffff] text-black py-6 rounded-full text-3xl font-bold hover:scale-105 transition"
            >
              Log In
            </button>
          </form>

          <p className="text-cyan-400 mt-10 text-lg">
            New here?{" "}
            <Link href="/signup" className="text-[#00ffff] underline hover:no-underline">
              Sign up for free trial
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
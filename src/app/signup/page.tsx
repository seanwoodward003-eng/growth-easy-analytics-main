import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-black flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-7xl md:text-8xl font-bold text-[#00ffff] text-center mb-16 animate-glitch">
          SIGN UP
        </h1>

        <div className="bg-[#0f1a3d]/60 border-2 border-[#00ffff] rounded-3xl p-12">
          <p className="text-2xl text-cyan-300 text-center mb-10">
            7-Day Free Trial • No Card Needed
          </p>

          <form className="space-y-8">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Choose password"
              className="w-full bg-black/60 border-2 border-[#00ffff] rounded-full px-10 py-6 text-xl text-cyan-100 placeholder-cyan-500 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#00ffff] text-black py-6 rounded-full text-3xl font-bold hover:scale-105 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-cyan-400 mt-10 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00ffff] underline hover:no-underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

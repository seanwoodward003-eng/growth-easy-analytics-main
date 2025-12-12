export default function Profile() {
  return (
    <div className="max-w-3xl mx-auto py-20">
      <h1 className="text-6xl font-black text-neon mb-16 text-center">PROFILE</h1>
      <div className="bg-black/40 border-2 border-neon rounded-2xl p-12">
        <p className="text-2xl mb-8">Email: you@company.com</p>
        <p className="text-2xl mb-8">Plan: Free Trial</p>
        <button className="bg-neon text-black px-8 py-4 rounded-lg font-bold">Manage Billing</button>
      </div>
    </div>
  );
}

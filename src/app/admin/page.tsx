// app/admin/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { getRows } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export default async function AdminPanel() {
  const user = await getCurrentUser();

  // CHANGE THIS TO YOUR EMAIL — only you can access
  if (!user || user.email !== 'seanwoodward003@gmail.com') {
    redirect('/');
  }

  const users = await getRows<{
    id: number;
    email: string;
    subscription_status: string;
    stripe_id: string | null;
  }>(
    'SELECT id, email, subscription_status, stripe_id FROM users ORDER BY id DESC'
  );

  return (
    <div className="min-h-screen bg-[#0a0f2c] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-black text-cyan-400 glow-title text-center mb-12">
          Admin Panel
        </h1>

        <div className="bg-black/40 backdrop-blur-xl border-4 border-cyan-400 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-cyan-300 mb-6">All Users ({users.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-cyan-600">
                  <th className="py-4 px-6 text-cyan-300">ID</th>
                  <th className="py-4 px-6 text-cyan-300">Email</th>
                  <th className="py-4 px-6 text-cyan-300">Status</th>
                  <th className="py-4 px-6 text-cyan-300">Stripe ID</th>
                  <th className="py-4 px-6 text-cyan-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-cyan-900/50">
                    <td className="py-4 px-6">{u.id}</td>
                    <td className="py-4 px-6">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        u.subscription_status === 'active' ? 'bg-green-500/30 text-green-300' :
                        u.subscription_status === 'trial' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {u.subscription_status || 'trial'}
                      </span>
                    </td>
                    <td className="py-4 px-6">{u.stripe_id || '—'}</td>
                    <td className="py-4 px-6">
                      {u.stripe_id && (
                        <form action="/api/admin/refund" method="POST">
                          <input type="hidden" name="user_id" value={u.id.toString()} />
                          <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition"
                          >
                            Refund Latest
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
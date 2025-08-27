import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import useAuthStore from '../lib/authStore';

export default function Login() {
  const nav = useNavigate();
  const setSession = useAuthStore(s => s.setSession);
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/auth2/login', form);
      setSession({ accessToken: data.accessToken, user: data.user });
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <input className="rounded-md bg-neutral-800 px-3 py-2" placeholder="Email"
               value={form.email} onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} />
        <input className="rounded-md bg-neutral-800 px-3 py-2" type="password" placeholder="Password"
               value={form.password} onChange={(e)=>setForm(f=>({ ...f, password: e.target.value }))} />
        {err && <p className="text-red-400">{err}</p>}
        <button className="btn">Sign in</button>
      </form>
      <div className="mt-3 text-sm text-neutral-400">
        <Link className="underline" to="/register-org">Register organization</Link> ·{' '}
        <Link className="underline" to="/register-user">Register user</Link>
      </div>
    </div>
  );
}

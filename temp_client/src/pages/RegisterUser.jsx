import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import useAuthStore from '../lib/authStore';

export default function RegisterUser() {
  const nav = useNavigate();
  const setSession = useAuthStore(s => s.setSession);
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationCode: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/auth2/register-user', form);
      setSession({ accessToken: data.accessToken, user: data.user });
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-semibold">Register User</h1>
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <input className="rounded-md bg-neutral-800 px-3 py-2" placeholder="Full name"
               onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} />
        <input className="rounded-md bg-neutral-800 px-3 py-2" placeholder="Email"
               onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} />
        <input className="rounded-md bg-neutral-800 px-3 py-2" type="password" placeholder="Password"
               onChange={(e)=>setForm(f=>({ ...f, password: e.target.value }))} />
        <input className="rounded-md bg-neutral-800 px-3 py-2" placeholder="Organization code (name)"
               onChange={(e)=>setForm(f=>({ ...f, organizationCode: e.target.value }))} />
        {err && <p className="text-red-400">{err}</p>}
        <button className="btn">Create</button>
      </form>
    </div>
  );
}

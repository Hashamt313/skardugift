import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

export default function Auth() {
  const [mode, setMode] = useState('sign-in');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const isAdmin = location.state?.admin;

  async function submit(event) {
    event.preventDefault();
    if (!supabase) return setMessage('Supabase is not configured.');
    const form = new FormData(event.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    setBusy(true); setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: form.get('full_name') } } });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === 'sign-up') return setMessage('Account created. Check your email if confirmation is enabled, then sign in.');
    localStorage.setItem('skardugift-token', result.data.session.access_token);
    if (isAdmin) return nav('/admin');
    try {
      await api.get('/admin/dashboard');
      nav('/admin');
    } catch {
      nav('/');
    }
  }

  return <main className="auth-page"><section className="auth-panel"><p className="eyebrow">SKARDUGIFT ACCOUNT</p><h1>{mode === 'sign-in' ? 'Welcome back' : 'Create an account'}</h1><p>{isAdmin ? 'Sign in with an administrator account to access the portal.' : 'Save your favourites and keep track of your orders.'}</p><form className="form" onSubmit={submit}>{mode === 'sign-up' && <input required name="full_name" placeholder="Full name"/>}<input required type="email" name="email" placeholder="Email address"/><input required minLength="6" type="password" name="password" placeholder="Password"/><button className="button green" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>{message && <p className="form-message">{message}</p>}<button className="text-button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }}>{mode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button><Link to="/" className="back-link">← Back to shop</Link></section></main>;
}

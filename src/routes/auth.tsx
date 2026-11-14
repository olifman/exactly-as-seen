import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@lovable.dev/cloud-auth-js/styles.css';

export const Route = createFileRoute('/auth')({ head: () => ({ meta: [
  { title: 'Owner sign-in | Lamesa Bekele' }, { name: 'description', content: 'Private sign-in for Lamesa Bekele’s portfolio project manager.' },
  { property: 'og:title', content: 'Owner sign-in | Lamesa Bekele' }, { property: 'og:description', content: 'Private portfolio management.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
] }), component: Auth });
function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin'); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: '/manager' }); }); }, [navigate]);
  async function submit() {
    setBusy(true); setMessage('');
    try {
      const values = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(128) }).parse({ email, password });
      const result = mode === 'signin' ? await supabase.auth.signInWithPassword(values) : await supabase.auth.signUp({ ...values, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      if (result.error) throw result.error;
      if (result.data.session) await navigate({ to: '/manager' }); else setMessage('Check your email to confirm your account.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to sign in.'); } finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setMessage('');
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) { setMessage(result.error.message); setBusy(false); return; }
    if (!result.redirected) await navigate({ to: '/manager' });
  }
  return <main className="min-h-screen bg-background px-6 py-16 text-foreground"><div className="mx-auto max-w-sm space-y-6">
    <a href="/portfolio/index.html" className="text-sm text-muted-foreground">← Portfolio</a>
    <div><p className="text-sm text-muted-foreground">Lamesa Bekele</p><h1 className="mt-2 text-3xl font-semibold">Owner sign-in</h1></div>
    <Button variant="outline" className="w-full" disabled={busy} onClick={() => social('google')}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continue with Google</Button>
    <Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button>
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit(); }}>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={email} maxLength={255} required onChange={e => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} /></div>
      <Button className="w-full" disabled={busy}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
    </form>
    <Button variant="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create owner account' : 'Back to sign-in'}</Button>
    {message && <p role="status" className="break-words text-sm">{message}</p>}
  </div></main>;
}
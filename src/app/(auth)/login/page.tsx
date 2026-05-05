'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/decks');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">FlipVerse</h1>
          <p className="text-sm text-text-secondary">
            Sign in to sync your progress
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter password"
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-text-secondary mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-primary hover:text-primary-hover font-medium"
          >
            Sign up
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link
            href="/decks"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}

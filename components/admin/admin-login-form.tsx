'use client';

import { useState, type SyntheticEvent } from 'react';
import { sitePath } from '@/lib/brand';

const GENERIC_ERROR = 'Correo o contraseña incorrectos.';

export function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(sitePath('/api/admin/login'), {
        method: 'POST',
        body: new FormData(event.currentTarget),
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; redirectTo?: string };
      if (!response.ok || !result.ok) {
        setError(result.error || GENERIC_ERROR);
        return;
      }
      window.location.assign(result.redirectTo || sitePath('/admin'));
    } catch {
      setError('No se pudo iniciar sesión. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <label>
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="username" required inputMode="email" />
      </label>
      <label>
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <p className="admin-login-error" role="alert" aria-live="polite">
        {error}
      </p>
      <button className="button button-light" type="submit" disabled={submitting}>
        {submitting ? 'INGRESANDO…' : 'INGRESAR'}
      </button>
    </form>
  );
}

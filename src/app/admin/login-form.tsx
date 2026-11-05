"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return (
    <form action={action} className="admin-login-form">
      <label htmlFor="admin-password">Senha do administrador</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      {state.error ? <p className="admin-error" role="alert">{state.error}</p> : null}
      <button type="submit" className="admin-primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

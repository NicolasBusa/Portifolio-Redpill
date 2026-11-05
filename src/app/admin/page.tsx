import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { loadPortfolio } from "@/lib/content-store";
import { signOut } from "./actions";
import LoginForm from "./login-form";
import PortfolioEditor from "./portfolio-editor";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração do portfólio",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!adminEnabled()) notFound();
  if (!(await isAdmin())) {
    return (
      <main className="admin admin-login">
        <section className="admin-card">
          <p className="admin-kicker">NB.exe / ACESSO RESTRITO</p>
          <h1>Painel do portfólio</h1>
          <p>Entre para editar os textos, projetos e contatos do site.</p>
          <LoginForm />
        </section>
      </main>
    );
  }
  const snapshot = await loadPortfolio();
  return (
    <main className="admin admin-shell">
      <header className="admin-header">
        <div><p className="admin-kicker">NB.exe / ADMIN</p><h1>Painel do portfólio</h1></div>
        <div className="admin-actions">
          <a href="/" target="_blank" rel="noreferrer">Ver site ↗</a>
          <form action={signOut}><button type="submit">Sair</button></form>
        </div>
      </header>
      <PortfolioEditor snapshot={snapshot} />
    </main>
  );
}

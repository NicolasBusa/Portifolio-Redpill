"use client";

import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { contactIcons, copyFields, maxCoverBytes, profileFields, type Content, type Project, type Snapshot } from "@/lib/content";
import { saveContent, uploadCover } from "./actions";
import HologramTuning from "./hologram-tuning";

const panels = {
  profile: "Perfil", copy: "Textos e SEO", intro: "Abertura", hologram: "Holograma", projects: "Projetos",
  skills: "Habilidades", contacts: "Contatos",
} as const;
type Panel = keyof typeof panels;
type Notice = { text: string; error?: boolean };

function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string;
}) {
  const id = useId();
  const inputProps = {
    "aria-labelledby": id,
    "aria-describedby": hint ? id + "-hint" : undefined,
  };
  return (
    <label className={multiline ? "admin-field admin-wide" : "admin-field"}>
      <span id={id}>{label}</span>
      {multiline ? <textarea {...inputProps} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input {...inputProps} value={value} onChange={(event) => onChange(event.target.value)} />}
      {hint ? <small id={id + "-hint"}>{hint}</small> : null}
    </label>
  );
}

const lines = (value: string) => value.split(/\r?\n/);
const emptyProject = (): Project => ({
  id: crypto.randomUUID(), name: "Novo projeto", description: "", longDescription: "",
  technologies: [], status: "Publicado", imageUrl: "", imageAlt: "", liveUrl: "", repoUrl: "",
});

export default function PortfolioEditor({ snapshot }: { snapshot: Snapshot }) {
  const [published, setPublished] = useState(snapshot);
  const [draft, setDraft] = useState(snapshot.content);
  const [panel, setPanel] = useState<Panel>("profile");
  const [projectId, setProjectId] = useState(snapshot.content.projects[0]?.id ?? "");
  const [notice, setNotice] = useState<Notice>();
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const active = draft.projects.find((project) => project.id === projectId);
  const dirty = JSON.stringify(draft) !== JSON.stringify(published.content);

  function patch<K extends keyof Content>(key: K, apply: (value: Content[K]) => Content[K]) {
    setDraft((current) => ({ ...current, [key]: apply(current[key]) }));
    setNotice(undefined);
  }

  function updateProject(id: string, fields: Partial<Project>) {
    patch("projects", (projects) => projects.map((project) => project.id === id ? { ...project, ...fields } : project));
  }

  function moveProject(id: string, offset: number) {
    patch("projects", (projects) => {
      const index = projects.findIndex((item) => item.id === id);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= projects.length) return projects;
      const reordered = [...projects];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  async function upload(id: string, file: File) {
    if (file.size > maxCoverBytes) {
      setNotice({ text: "A imagem deve ter até 2 MB.", error: true });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set("cover", file);
      const result = await uploadCover(form);
      if (result.error) setNotice({ text: result.error, error: true });
      else if (result.url) updateProject(id, { imageUrl: result.url });
    } catch {
      setNotice({ text: "Falha ao enviar a imagem. Tente novamente.", error: true });
    } finally {
      setUploading(false);
    }
  }

  function publish() {
    setNotice(undefined);
    startSaving(async () => {
      try {
        const result = await saveContent(draft, published.revision);
        if (result.error) setNotice({ text: result.error, error: true });
        else if (result.content && result.revision) {
          setPublished({ content: result.content, revision: result.revision });
          setDraft(result.content);
          setNotice({ text: "Alterações publicadas." });
        }
      } catch {
        setNotice({ text: "Falha ao publicar. Suas alterações continuam no formulário.", error: true });
      }
    });
  }

  return (
    <>
      <nav className="admin-tabs" aria-label="Seções da administração">
        {Object.entries(panels).map(([key, title]) => (
          <button key={key} type="button" aria-pressed={key === panel} onClick={() => setPanel(key as Panel)}>{title}</button>
        ))}
      </nav>
      <form onSubmit={(event) => { event.preventDefault(); publish(); }}>
        <fieldset className="admin-card admin-fields" disabled={saving || uploading}>
          <legend className="sr-only">{panels[panel]}</legend>
          <h2>{panels[panel]}</h2>

          {panel === "hologram" && <HologramTuning settings={draft.hologram} onChange={(settings) => patch("hologram", () => settings)} />}

          {panel === "profile" && <div className="admin-grid">
            {(Object.keys(profileFields) as (keyof typeof profileFields)[]).map((key) =>
              <Field key={key} label={profileFields[key]} value={draft.profile[key]} onChange={(value) => patch("profile", (data) => ({ ...data, [key]: value }))} />
            )}
            <Field label="Linhas digitadas na página inicial" hint="Uma frase por linha. Até quatro linhas." multiline value={draft.profile.heroLines.join("\n")} onChange={(value) => patch("profile", (data) => ({ ...data, heroLines: lines(value) }))} />
            <Field label="Biografia" hint="Um parágrafo por linha." multiline value={draft.profile.bio.join("\n")} onChange={(value) => patch("profile", (data) => ({ ...data, bio: lines(value) }))} />
          </div>}

          {panel === "copy" && <div className="admin-grid">
            {(Object.keys(copyFields) as (keyof typeof copyFields)[]).map((key) =>
              <Field key={key} label={copyFields[key]} multiline={key.endsWith("Description")} value={draft.copy[key]} onChange={(value) => patch("copy", (data) => ({ ...data, [key]: value }))} />
            )}
          </div>}

          {panel === "intro" && <div className="admin-grid">
            <Field label="Identificador do terminal" value={draft.intro.caption} onChange={(caption) => patch("intro", (data) => ({ ...data, caption }))} />
            <Field label="Mensagem de boas-vindas" value={draft.intro.welcome} onChange={(welcome) => patch("intro", (data) => ({ ...data, welcome }))} />
            <Field label="Complemento das boas-vindas" value={draft.intro.subtitle} onChange={(subtitle) => patch("intro", (data) => ({ ...data, subtitle }))} />
            {draft.intro.lines.map((line, index) => <Field key={index} label={`Mensagem de inicialização ${index + 1}`} value={line} onChange={(value) =>
              patch("intro", (data) => ({ ...data, lines: data.lines.map((current, i) => i === index ? value : current) }))} />)}
          </div>}

          {panel === "projects" && <>
            <div className="admin-toolbar">
              <label className="admin-field">
                <span>Projeto</span>
                <select value={active?.id ?? ""} onChange={(event) => setProjectId(event.target.value)}>
                  {!active && <option value="">Selecione um projeto</option>}
                  {draft.projects.map(({ id, name }) => <option key={id} value={id}>{name || "Sem nome"}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => {
                const project = emptyProject();
                patch("projects", (projects) => [...projects, project]);
                setProjectId(project.id);
              }}>+ Adicionar projeto</button>
            </div>
            {active && <>
              <div className="admin-grid" key={active.id}>
                <Field label="Nome do projeto" value={active.name} onChange={(name) => updateProject(active.id, { name })} />
                <Field label="Status" value={active.status} onChange={(status) => updateProject(active.id, { status })} />
                <Field label="Descrição" multiline value={active.description} onChange={(description) => updateProject(active.id, { description })} />
                <Field label="Detalhes do projeto" multiline value={active.longDescription} onChange={(longDescription) => updateProject(active.id, { longDescription })} />
                <Field label="Stack técnica" hint="Uma tecnologia por linha." multiline value={active.technologies.join("\n")} onChange={(value) => updateProject(active.id, { technologies: value ? lines(value) : [] })} />
                <Field label="Link da demonstração" value={active.liveUrl} onChange={(liveUrl) => updateProject(active.id, { liveUrl })} />
                <Field label="Link do repositório" value={active.repoUrl} onChange={(repoUrl) => updateProject(active.id, { repoUrl })} />
                <label className="admin-field">
                  <span>Imagem de capa</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(active.id, file);
                    event.target.value = "";
                  }} />
                  <small>JPG, PNG ou WebP, até 2 MB.</small>
                </label>
                <Field label="Descrição acessível da imagem" value={active.imageAlt} onChange={(imageAlt) => updateProject(active.id, { imageAlt })} />
                {active.imageUrl && <div className="admin-cover admin-wide">
                  <Image src={active.imageUrl} alt={active.imageAlt || active.name} width={200} height={110} unoptimized />
                  <button type="button" onClick={() => updateProject(active.id, { imageUrl: "", imageAlt: "" })}>Retirar capa</button>
                </div>}
              </div>
              <div className="admin-row">
                <button type="button" onClick={() => moveProject(active.id, -1)}>Mover para cima</button>
                <button type="button" onClick={() => moveProject(active.id, 1)}>Mover para baixo</button>
                <button type="button" className="admin-remove" onClick={() => {
                  if (!window.confirm("Remover este projeto do formulário? A remoção será aplicada ao publicar.")) return;
                  const remaining = draft.projects.filter(({ id }) => id !== active.id);
                  patch("projects", () => remaining);
                  setProjectId(remaining[0]?.id ?? "");
                }}>Remover projeto</button>
              </div>
            </>}
          </>}

          {panel === "skills" && <>
            {draft.skills.map((category) => (
              <section className="admin-item admin-grid" key={category.id} aria-label={category.name}>
                <Field label="Nome da categoria" value={category.name} onChange={(name) =>
                  patch("skills", (items) => items.map((item) => item.id === category.id ? { ...item, name } : item))} />
                <Field label="Habilidades" hint="Uma habilidade por linha." multiline value={category.modules.join("\n")} onChange={(value) =>
                  patch("skills", (items) => items.map((item) => item.id === category.id ? { ...item, modules: value ? lines(value) : [] } : item))} />
                <button type="button" className="admin-remove" onClick={() => patch("skills", (items) => items.filter(({ id }) => id !== category.id))}>Remover categoria</button>
              </section>
            ))}
            <button type="button" onClick={() => {
              const id = crypto.randomUUID();
              patch("skills", (items) => [...items, { id, name: "Nova categoria", modules: [] }]);
            }}>+ Adicionar categoria</button>
          </>}

          {panel === "contacts" && <>
            {draft.contacts.map((contact) => {
              const update = (fields: Partial<typeof contact>) =>
                patch("contacts", (items) => items.map((item) => item.id === contact.id ? { ...item, ...fields } : item));
              return <section className="admin-item admin-grid" key={contact.id} aria-label={contact.label}>
                <Field label="Nome do contato" value={contact.label} onChange={(label) => update({ label })} />
                <Field label="Texto complementar" value={contact.sublabel} onChange={(sublabel) => update({ sublabel })} />
                <Field label="Endereço" hint="URL ou mailto:voce@exemplo.com." value={contact.href} onChange={(href) => update({ href })} />
                <label className="admin-field"><span>Ícone</span><select value={contact.icon} onChange={(event) => update({ icon: event.target.value as typeof contact.icon })}>
                  {contactIcons.map((icon) => <option key={icon} value={icon}>{({ github: "GitHub", linkedin: "LinkedIn", email: "E-mail", link: "Link" })[icon]}</option>)}
                </select></label>
                <button type="button" className="admin-remove" onClick={() => patch("contacts", (items) => items.filter(({ id }) => id !== contact.id))}>Remover contato</button>
              </section>;
            })}
            <button type="button" onClick={() => {
              const id = crypto.randomUUID();
              patch("contacts", (items) => [...items, { id, label: "Novo contato", sublabel: "", href: "", icon: "link" }]);
            }}>+ Adicionar contato</button>
          </>}
        </fieldset>
        <div className="admin-publish">
          <span role={notice?.error ? "alert" : "status"} className={notice?.error ? "admin-error" : undefined}>
            {notice?.text ?? (uploading ? "Enviando capa…" : dirty ? "Alterações ainda não publicadas" : "Conteúdo publicado")}
          </span>
          <button type="submit" className="admin-primary" disabled={!dirty || saving || uploading}>{saving ? "Publicando…" : "Publicar alterações"}</button>
        </div>
      </form>
    </>
  );
}

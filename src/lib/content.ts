import { z } from "zod";
import { defaultHologramSettings, hologramQualities, signalControls, type SignalKey } from "./hologram-settings";

const text = (max: number) => z.string().trim().min(1, "Preencha este campo.").max(max);
const optionalText = (max: number) => z.string().trim().max(max);
const withoutBlankLines = (value: unknown) => Array.isArray(value)
  ? value.filter((line) => typeof line !== "string" || line.trim())
  : value;
const id = z.string().regex(/^[a-z0-9-]{1,80}$/);
const website = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]);
const contactUrl = z.union([website, z.string().regex(/^mailto:[^\s?@]+@[^\s?@]+\.[^\s?@]+$/i)]);
export const coverPath = /^(?:\/projects\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp)|\/media\/[0-9a-f]{64})$/;

export const profileFields = {
  name: "Nome completo",
  role: "Ocupação",
  education: "Formação",
  institution: "Instituição",
  year: "Ano acadêmico",
  semester: "Semestre",
  location: "Localização",
} as const;

export const copyFields = {
  seoTitle: "Título da página (SEO)",
  seoDescription: "Descrição da página (SEO)",
  projectsButton: "Botão principal da página inicial",
  contactButton: "Botão de contato da página inicial",
  aboutTitle: "Título de Sobre mim",
  aboutButton: "Botão de Sobre mim",
  projectsTitle: "Título de Projetos",
  projectsDescription: "Texto de Projetos",
  skillsTitle: "Título de Habilidades",
  skillsDescription: "Texto de Habilidades",
  contactTitle: "Título de Contato",
  contactDescription: "Texto de Contato",
  footer: "Nota do rodapé",
} as const;

const profile = z.object({
  name: text(64), role: text(70), education: text(80), institution: text(35),
  year: text(12), semester: text(12), location: text(60),
  heroLines: z.preprocess(withoutBlankLines, z.array(text(110)).min(1).max(4)),
  bio: z.preprocess(withoutBlankLines, z.array(text(1200)).min(1).max(8)),
});
const copy = z.object({
  seoTitle: text(100), seoDescription: text(250),
  projectsButton: text(28), contactButton: text(28), aboutTitle: text(65), aboutButton: text(38),
  projectsTitle: text(65), projectsDescription: text(180), skillsTitle: text(65), skillsDescription: text(180),
  contactTitle: text(65), contactDescription: text(280), footer: text(170),
});
const project = z.object({
  id, name: text(85), description: text(400), longDescription: optionalText(2500),
  technologies: z.preprocess(withoutBlankLines, z.array(text(45)).max(24)), status: text(30),
  imageUrl: z.union([z.literal(""), z.string().regex(coverPath)]), imageAlt: optionalText(180),
  liveUrl: website, repoUrl: website,
});
const category = z.object({ id, name: text(50), modules: z.preprocess(withoutBlankLines, z.array(text(50)).max(32)) });
export const contactIcons = ["github", "linkedin", "email", "link"] as const;
const contact = z.object({ id, label: text(40), sublabel: optionalText(100), href: contactUrl, icon: z.enum(contactIcons) });
const signal = (key: SignalKey) => z.number().min(signalControls[key].min).max(signalControls[key].max);
const hologram = z.object({
  quality: z.enum(hologramQualities),
  particleDensity: signal("particleDensity"),
  particleSize: signal("particleSize"),
  glowIntensity: signal("glowIntensity"),
  animationSpeed: signal("animationSpeed"),
  interactionStrength: signal("interactionStrength"),
}).default(defaultHologramSettings);

export const contentSchema = z.object({
  profile, copy,
  intro: z.object({
    caption: text(68), lines: z.array(text(58)).length(5), welcome: text(25), subtitle: text(42),
  }),
  projects: z.array(project).max(60),
  skills: z.array(category).max(18),
  contacts: z.array(contact).max(18),
  hologram,
}).refine(({ projects, skills, contacts }) => [projects, skills, contacts].every((items) =>
  new Set(items.map((item) => item.id)).size === items.length
), { message: "Há identificadores duplicados no conteúdo." });

export type Content = z.infer<typeof contentSchema>;
export type Project = Content["projects"][number];
export type Contact = Content["contacts"][number];
export type Snapshot = { revision: number; content: Content };
export const maxCoverBytes = 2 * 1024 * 1024;

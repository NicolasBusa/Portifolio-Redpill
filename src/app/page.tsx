import type { Metadata } from "next";
import Portfolio from "@/portfolio";
import { loadPortfolio } from "@/lib/content-store";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await loadPortfolio();
  const { seoTitle: title, seoDescription: description } = content.copy;
  return {
    title, description,
    alternates: getSiteUrl() ? { canonical: "/" } : undefined,
    openGraph: { title, description, type: "website", locale: "pt_BR", url: getSiteUrl() },
  };
}

export default async function Home() {
  const { content } = await loadPortfolio();
  return <Portfolio content={content} />;
}

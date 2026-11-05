import { ImageResponse } from 'next/og';
import { loadPortfolio } from '@/lib/content-store';

export const dynamic = 'force-dynamic';
export const alt = 'Imagem de compartilhamento do portfólio Matrix';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const { content: { profile } } = await loadPortfolio();
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', background: '#020805', color: '#e8ffe8', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 85, border: '20px solid #003b18' }}>
      <div style={{ color: '#00ff41', fontSize: 24, letterSpacing: 5 }}>SYSTEM.USER_PROFILE / 01</div>
      <div style={{ fontWeight: 800, fontSize: profile.name.length > 28 ? 68 : 105, lineHeight: 1.1, marginTop: 22 }}>{profile.name}</div>
      <div style={{ color: '#a4b5ac', fontSize: 33, marginTop: 25 }}>{profile.role} · {profile.education} · {profile.institution}</div>
    </div>,
    size,
  );
}

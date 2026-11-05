# Nicolas Busa · Portfólio Matrix

Aplicação em Next.js, TypeScript, Tailwind CSS e Motion. A interface e as animações partem da exportação React **Portifolio Pessoal** do Figma.

## Executar no VS Code

Use Node.js 24 LTS e abra a pasta do projeto no terminal:

```powershell
npm ci
npm run admin:setup
npm run dev
```

O comando de configuração grava o hash da senha em `.env.local` e exibe uma senha aleatória uma única vez. Guarde-a em um gerenciador de senhas. Caso o servidor já esteja aberto, reinicie-o depois de criar a configuração.

- [Site público](http://localhost:3000)
- [Painel privado](http://localhost:3000/admin)

Mantenha o terminal aberto enquanto usa o site. Para encerrar o servidor, use Ctrl+C. Se o Next.js escolher outra porta, use o endereço que o terminal exibir e acrescente `/admin` para acessar o painel.

## Usar o painel

Entre com a senha e escolha uma aba. **Perfil** altera a apresentação e a ficha acadêmica. **Textos e SEO** controla títulos, descrições, botões e rodapé. **Abertura** edita a sequência digitada. **Projetos** permite adicionar, reordenar e remover cards, enviar capas JPG, PNG ou WebP de até 2 MB, descrever as imagens e editar a stack e os links. **Habilidades** e **Contatos** permitem adicionar, editar e remover itens.

Clique em **Publicar alterações** para aplicar todas as abas de uma vez. Abra **Ver site** para conferir o resultado. Ao salvar de duas abas ao mesmo tempo, a segunda receberá um aviso para evitar sobrescrever o conteúdo publicado. Para rever a abertura, abra uma janela privativa.

Na aba **Holograma**, escolha a qualidade e ajuste densidade, tamanho das partículas, luminosidade, velocidade e influência do cursor. A prévia reage na hora. Clique em **Publicar alterações** para usar os ajustes na página inicial. A página pública oferece o botão **Click to decode** para dispersar e reconstruir a figura.

No terminal público, digite `redpill` para entrar no **mundo simulado**. O portfólio muda de visual e mostra o vídeo no lugar do holograma. Use **Voltar para a Matrix**, abaixo do vídeo, ou digite `bluepill` no terminal para retornar. A escolha fica na sessão da aba, inclusive ao recarregar.

O painel usa uma senha individual e encerra a sessão em até 12 horas. Para trocar a senha, remova a linha `PORTFOLIO_ADMIN_HASH` de `.env.local`, execute `npm run admin:setup` e reinicie o servidor. A troca invalida as sessões antigas.

## Onde ficam os dados

No computador, o Next.js cria `.portfolio-data/portfolio.db` e grava o conteúdo e as imagens lá. Para fazer backup, pare o servidor e copie a pasta `.portfolio-data` inteira. Guarde `.env.local` separadamente. O ZIP do projeto contém o código e os exemplos originais, enquanto as alterações publicadas ficam no banco local.

## Publicar na Vercel

1. Importe o repositório no painel da Vercel com o preset **Next.js** e Node.js **24.x**. Se o código estiver em uma subpasta, selecione-a em **Root Directory**.
2. Para habilitar o painel no site publicado, crie um banco **Turso** e configure **TURSO_DATABASE_URL**, **TURSO_AUTH_TOKEN** e **PORTFOLIO_ADMIN_HASH** nas variáveis do projeto. Use o hash gerado pelo script e guarde a senha original. O banco remoto começa com o conteúdo da exportação. Alterações no SQLite local pertencem ao ambiente local.
3. Configure **SITE_URL** com a origem pública para canonical, Open Graph e sitemap. A aplicação pode usar **VERCEL_PROJECT_PRODUCTION_URL** quando disponível.
4. Após o deploy, abra `/admin` diretamente. Sem as variáveis de administração e armazenamento remoto, a Vercel serve o conteúdo inicial.

[Next.js na Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) · [SDK TypeScript do Turso](https://docs.turso.tech/sdk/ts/reference)

## Verificação

```powershell
npm run lint
npm run build
npm run typecheck
```

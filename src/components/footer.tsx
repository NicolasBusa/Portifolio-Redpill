export function Footer({ name, note }: { name: string; note: string }) {
  return (
    <footer
      className="portfolio-footer relative py-10 px-6"
      style={{ zIndex: 1, borderTop: "1px solid #001A09" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.62rem",
            color: "#72A582",
            letterSpacing: "0.2em",
          }}
        >
          © {new Date().getUTCFullYear()} {name} — Todos os direitos reservados
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.62rem",
            color: "#72A582",
            letterSpacing: "0.15em",
          }}
        >
          {note}
        </span>
      </div>
    </footer>
  );
}

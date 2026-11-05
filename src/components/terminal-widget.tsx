import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Minus } from "lucide-react";
import type { Content } from "@/lib/content";

type CommandOutput = {
  type: "input" | "output" | "error" | "system";
  text: string;
};

const HELP_TEXT = `
COMANDOS DISPONÍVEIS:
  help        — Mostra esta mensagem
  about       — Abre a seção Sobre
  projects    — Abre a seção Projetos
  skills      — Abre a seção Habilidades
  contact     — Abre a seção Contato
  whoami      — Mostra o perfil
  ls          — Lista seções e projetos
  clear       — Limpa o terminal
  exit        — Fecha o terminal
  matrix      — Ativa um efeito secreto 🐇
  redpill     — Entra no mundo simulado
  bluepill    — Volta para a Matrix
`.trim();

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) location.hash = id;
}

export function TerminalWidget({ profile, projects, simulated, onWorldChange }: {
  profile: Content["profile"]; projects: Content["projects"]; simulated: boolean; onWorldChange: (simulated: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandOutput[]>([
    { type: "system", text: "MATRIX OS v3.19 — TERMINAL" },
    { type: "system", text: 'Digite "help" para ver os comandos disponíveis.' },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  const [matrixMode, setMatrixMode] = useState(false);
  const reduced = useReducedMotion();
  const matrixTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setMinimized(false);
      setOpen(true);
    };
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== "~" || event.ctrlKey || event.altKey || event.metaKey || event.isComposing || event.repeat) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest("input, textarea, select"))) return;
      event.preventDefault();
      handleToggle();
    };
    window.addEventListener("toggle-terminal", handleToggle);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("toggle-terminal", handleToggle);
      window.removeEventListener("keydown", handleShortcut);
      clearTimeout(matrixTimer.current);
    };
  }, []);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  function closeTerminal() {
    setOpen(false);
    requestAnimationFrame(() => {
      const target = previousFocus.current;
      if (target && target !== document.body && target.isConnected && target.getClientRects().length) target.focus({ preventScroll: true });
      else launcherRef.current?.focus({ preventScroll: true });
    });
  }

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory: CommandOutput[] = [
      ...history,
      { type: "input", text: `> ${cmd}` },
    ];

    if (!trimmed) {
      setHistory(newHistory);
      return;
    }

    setCmdHistory((prev) => [cmd, ...prev]);
    setCmdIndex(-1);

    let output: CommandOutput;

    switch (trimmed) {
      case "help":
        output = { type: "output", text: HELP_TEXT };
        break;
      case "about":
        output = { type: "output", text: "Abrindo a seção Sobre…" };
        setTimeout(() => scrollToSection("about"), 300);
        break;
      case "projects":
        output = { type: "output", text: "Abrindo a seção Projetos…" };
        setTimeout(() => scrollToSection("projects"), 300);
        break;
      case "skills":
        output = { type: "output", text: "Abrindo a seção Habilidades…" };
        setTimeout(() => scrollToSection("skills"), 300);
        break;
      case "contact":
        output = { type: "output", text: "Abrindo a seção Contato…" };
        setTimeout(() => scrollToSection("contact"), 300);
        break;
      case "whoami":
        output = { type: "output", text: "USER: " + profile.name + "\nROLE: " + profile.role + "\nEDUCATION: " + profile.education + " · " + profile.institution + " · Semestre " + profile.semester };
        break;
      case "ls":
        output = { type: "output", text: ["/portfolio/", "├── hero/", "├── about/", "├── projects/", ...projects.map(({ name }) => "│   · " + name), "├── skills/", "└── contact/"].join("\n") };
        break;
      case "clear":
        setHistory([{ type: "system", text: "Terminal limpo." }]);
        setInput("");
        return;
      case "exit":
        closeTerminal();
        return;
      case "matrix":
      case "follow-the-white-rabbit":
        if (!reduced && !simulated) {
          setMatrixMode(true);
          clearTimeout(matrixTimer.current);
          matrixTimer.current = setTimeout(() => setMatrixMode(false), 3000);
        }
        output = {
          type: "output",
          text: "Acorde, Neo…\nA Matrix pegou você…\nSiga o coelho branco. 🐇",
        };
        break;
      case "redpill":
        clearTimeout(matrixTimer.current);
        setMatrixMode(false);
        onWorldChange(true);
        output = {
          type: "output",
          text: simulated ? "Você já está no mundo simulado." : "Você entrou no mundo simulado. Digite bluepill para voltar à Matrix.",
        };
        break;
      case "bluepill":
        onWorldChange(false);
        output = {
          type: "output",
          text: simulated ? "Você voltou para a Matrix." : "A história termina.\nVocê acorda na sua cama e acredita no que quiser.",
        };
        break;
      default:
        output = {
          type: "error",
          text: `Comando desconhecido: "${trimmed}"\nDigite "help" para ver os comandos disponíveis.`,
        };
    }

    setHistory([...newHistory, output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = Math.min(cmdIndex + 1, cmdHistory.length - 1);
      setCmdIndex(nextIndex);
      setInput(cmdHistory[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.max(cmdIndex - 1, -1);
      setCmdIndex(nextIndex);
      setInput(nextIndex === -1 ? "" : cmdHistory[nextIndex]);
    }
  };

  return (
    <>
      {/* Matrix mode overlay */}
      <AnimatePresence>
        {matrixMode && !reduced && !simulated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 150, background: "rgba(0,255,65,0.05)" }}
          />
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={launcherRef}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={simulated ? { duration: 0 } : undefined}
            onClick={() => { previousFocus.current = null; setMinimized(false); setOpen(true); }}
            className="terminal-launcher fixed bottom-6 right-6 flex items-center gap-2 transition-all duration-200"
            style={{
              zIndex: 90,
              fontFamily: "monospace",
              fontSize: "0.72rem",
              color: "#72A582",
              border: "1px solid #003B18",
              padding: "10px 16px",
              background: "rgba(0,8,2,0.9)",
              cursor: "pointer",
              letterSpacing: "0.1em",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.color = "#00FF41";
              t.style.borderColor = "#00FF41";
              t.style.boxShadow = "0 0 15px rgba(0,255,65,0.3)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.color = "#72A582";
              t.style.borderColor = "#003B18";
              t.style.boxShadow = "none";
            }}
          >
            {!simulated && <span style={{ animation: "matrixBlink 1s step-end infinite" }}>▊</span>}
            <span>{simulated ? "Terminal" : "> TERMINAL"}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Terminal window */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="region"
            aria-label="Console Matrix"
            onKeyDown={(event) => { if (event.key === "Escape") closeTerminal(); }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={minimized ? { opacity: 1, y: 0, scale: 1, height: "auto" } : { opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={simulated ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
            className="terminal-window fixed bottom-6 right-3 sm:right-6 overflow-hidden"
            style={{
              zIndex: 90,
              width: "min(420px, calc(100vw - 24px))",
              border: "1px solid #003B18",
              background: "rgba(0, 5, 2, 0.97)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 40px rgba(0,255,65,0.08), 0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Title bar */}
            <div
              className="terminal-header flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: "1px solid #003B18", background: "rgba(0,15,5,0.8)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#00FF41", boxShadow: "0 0 6px #00FF41" }}
                />
                <span
                  style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#72A582", letterSpacing: "0.2em" }}
                >
                  {simulated ? "Terminal" : "MATRIX_TERMINAL — NB.exe"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={minimized ? "Restaurar terminal" : "Minimizar terminal"}
                  onClick={() => setMinimized((m) => !m)}
                  className="p-1 transition-colors"
                  style={{ color: "#72A582", background: "transparent", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00FF41")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#72A582")}
                >
                  <Minus size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Fechar terminal"
                  onClick={closeTerminal}
                  className="p-1 transition-colors"
                  style={{ color: "#72A582", background: "transparent", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00FF41")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#72A582")}
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Output area */}
            {!minimized && (
              <>
                <div
                  ref={outputRef}
                  role="log"
                  aria-label="Saída do terminal"
                  className="overflow-y-auto p-4 space-y-1"
                  style={{ height: "min(280px, calc(100dvh - 150px))", scrollbarWidth: "thin", scrollbarColor: "#003B18 transparent" }}
                >
                  {history.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.68rem",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        color:
                          entry.type === "input"
                            ? "#00FF41"
                            : entry.type === "error"
                            ? "#ff4444"
                            : entry.type === "system"
                            ? "#72A582"
                            : "#81918A",
                        textShadow: entry.type === "input" ? "0 0 6px rgba(0,255,65,0.3)" : "none",
                      }}
                    >
                      {entry.text}
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderTop: "1px solid #001A09" }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00FF41", flexShrink: 0 }}>
                    {"NB@matrix:~$"}
                  </span>
                  <input
                    ref={inputRef}
                    aria-label="Comando do terminal"
                    enterKeyHint="send"
                    maxLength={120}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-w-0 flex-1 bg-transparent"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "#00FF41",
                      border: "none",
                      caretColor: "#00FF41",
                    }}
                    placeholder=""
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

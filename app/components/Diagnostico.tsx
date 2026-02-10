"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DIMENSIONS,
  getLevel,
  getBarColor,
  calculateScores,
  calculateOverall,
  getStrongest,
  getWeakest,
  type Answers,
  type Scores,
} from "../data";

// ─── Helpers ───────────────────────────────────────────

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 11;
}

// ─── RadarChart ────────────────────────────────────────

function RadarChart({ scores, size = 280 }: { scores: Scores; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const dims = Object.keys(scores);
  const angleStep = (2 * Math.PI) / dims.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size }}>
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={dims
            .map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#C8B89A"
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}

      {dims.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#C8B89A"
            strokeWidth="0.5"
            opacity="0.4"
          />
        );
      })}

      <polygon
        points={dims
          .map((d, i) => {
            const p = getPoint(i, scores[d]);
            return `${p.x},${p.y}`;
          })
          .join(" ")}
        fill="rgba(163, 55, 34, 0.15)"
        stroke="#A33722"
        strokeWidth="2"
      />

      {dims.map((d, i) => {
        const p = getPoint(i, scores[d]);
        return <circle key={d} cx={p.x} cy={p.y} r="4" fill="#A33722" />;
      })}

      {dims.map((d, i) => {
        const dim = DIMENSIONS.find((dm) => dm.id === d);
        const p = getPoint(i, 118);
        const angle = angleStep * i - Math.PI / 2;
        const isLeft = Math.cos(angle) < -0.1;
        const isRight = Math.cos(angle) > 0.1;
        return (
          <text
            key={d}
            x={p.x}
            y={p.y}
            textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
            dominantBaseline="middle"
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fill: "#5C4A3A",
              fontWeight: 500,
            }}
          >
            {dim?.name}
          </text>
        );
      })}
    </svg>
  );
}

// ─── ProgressBar ───────────────────────────────────────

function ProgressBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color?: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#E8DDD0" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color || "#A33722",
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────

function Footer() {
  return (
    <div
      className="text-center mt-12 pb-8"
      style={{ fontSize: 12, color: "#B8A898", fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      Por Kevin · Íntegros
    </div>
  );
}

// ─── Stage Wrapper ─────────────────────────────────────

function StageWrapper({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────

type Stage = "intro" | "cadastro" | "quiz" | "loading" | "result";

export default function Diagnostico() {
  const [stage, setStage] = useState<Stage>("intro");
  const [visible, setVisible] = useState(true);

  // Cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cadastro step-by-step
  const [cadastroStep, setCadastroStep] = useState(0);
  const [cadastroFieldVisible, setCadastroFieldVisible] = useState(true);

  // Quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [questionVisible, setQuestionVisible] = useState(true);

  // Result
  const [scores, setScores] = useState<Scores>({});
  const [overall, setOverall] = useState(0);
  const transitionRef = useRef(false);

  const allQuestions = DIMENSIONS.flatMap((dim) =>
    dim.questions.map((q, qi) => ({
      ...q,
      dimensionId: dim.id,
      dimensionName: dim.name,
      dimensionIcon: dim.icon,
      questionIndex: qi,
      key: `${dim.id}_${qi}`,
    }))
  );

  const totalQuestions = allQuestions.length;

  const transition = useCallback(
    (to: Stage) => {
      if (transitionRef.current) return;
      transitionRef.current = true;
      setVisible(false);
      setTimeout(() => {
        setStage(to);
        setVisible(true);
        transitionRef.current = false;
      }, 300);
    },
    []
  );

  const cadastroFields = [
    {
      label: "Nome completo",
      placeholder: "Seu nome",
      type: "text",
      key: "nome",
      value: nome,
      onChange: (v: string) => { setNome(v); setFormErrors((p) => ({ ...p, nome: "" })); },
      validate: () => nome.trim() ? "" : "Nome é obrigatório",
    },
    {
      label: "E-mail",
      placeholder: "seu@email.com",
      type: "email",
      key: "email",
      value: email,
      onChange: (v: string) => { setEmail(v); setFormErrors((p) => ({ ...p, email: "" })); },
      validate: () => isValidEmail(email) ? "" : "E-mail inválido",
    },
    {
      label: "WhatsApp",
      placeholder: "(11) 99999-9999",
      type: "tel",
      key: "whatsapp",
      value: whatsapp,
      onChange: (v: string) => { setWhatsapp(formatPhone(v)); setFormErrors((p) => ({ ...p, whatsapp: "" })); },
      validate: () => isValidPhone(whatsapp) ? "" : "WhatsApp inválido",
    },
  ];

  const handleCadastroNext = () => {
    const field = cadastroFields[cadastroStep];
    const error = field.validate();
    if (error) {
      setFormErrors({ [field.key]: error });
      return;
    }
    setFormErrors({});

    if (cadastroStep < cadastroFields.length - 1) {
      setCadastroFieldVisible(false);
      setTimeout(() => {
        setCadastroStep((prev) => prev + 1);
        setCadastroFieldVisible(true);
      }, 300);
    } else {
      transition("quiz");
    }
  };

  const handleCadastroKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCadastroNext();
    }
  };

  const handleAnswer = (value: number) => {
    const q = allQuestions[currentQuestion];
    const newAnswers = { ...answers, [q.key]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setQuestionVisible(false);
        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
          setQuestionVisible(true);
        }, 300);
      } else {
        // Last question — calculate and save
        const s = calculateScores(newAnswers);
        const o = calculateOverall(s);
        const strong = getStrongest(s);
        const weak = getWeakest(s);
        const level = getLevel(o);

        setScores(s);
        setOverall(o);

        transition("loading");

        // Save lead — wait at least 800ms so loading screen is visible
        const savePromise = fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            email,
            whatsapp,
            nota_geral: o,
            nivel: level.name,
            clareza: s.clareza,
            comercial: s.comercial,
            tempo: s.tempo,
            aquisicao: s.aquisicao,
            entrega: s.entrega,
            financeiro: s.financeiro,
            equipe: s.equipe,
            ponto_forte: strong.name,
            maior_gargalo: weak.name,
            respostas_json: newAnswers,
          }),
        }).catch(() => {
          // Graceful degradation: ignore save failure
        });

        const minDelay = new Promise((r) => setTimeout(r, 1200));

        Promise.all([savePromise, minDelay]).then(() => {
          transition("result");
        });
      }
    }, 400);
  };

  const level = getLevel(overall);
  const strongest = getStrongest(scores);
  const weakest = getWeakest(scores);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <div className="flex-1 w-full max-w-[580px] mx-auto px-5 py-8">
        {/* ── INTRO ── */}
        {stage === "intro" && (
          <StageWrapper visible={visible}>
            <div className="text-center pt-8">
              <h1
                className="leading-tight mb-4"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(32px, 8vw, 44px)",
                  fontWeight: 700,
                  color: "#2A1F17",
                  lineHeight: 1.1,
                }}
              >
                Diagnóstico de Maturidade de Negócio
              </h1>
              <p
                className="mb-10"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontStyle: "italic",
                  color: "#5C4A3A",
                  lineHeight: 1.4,
                }}
              >
                14 perguntas pra descobrir se você tem um negócio de verdade — ou
                um emprego disfarçado que você mesmo criou.
              </p>

              <div className="flex flex-wrap justify-center gap-2.5 mb-10">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg"
                    style={{
                      background: "#F3EDE4",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#2A1F17",
                    }}
                  >
                    {dim.icon} {dim.name}
                  </div>
                ))}
              </div>

              <button
                onClick={() => transition("cadastro")}
                className="w-full py-4 rounded-lg text-white font-semibold text-base cursor-pointer transition-colors duration-200"
                style={{ background: "#A33722" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#8B2E1C")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#A33722")
                }
              >
                Começar diagnóstico
              </button>
            </div>
          </StageWrapper>
        )}

        {/* ── CADASTRO (step-by-step) ── */}
        {stage === "cadastro" && (
          <StageWrapper visible={visible}>
            <div className="pt-8">
              <h2
                className="text-center mb-2"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#2A1F17",
                }}
              >
                Antes de começar
              </h2>
              <p
                className="text-center mb-2"
                style={{ fontSize: 15, color: "#5C4A3A" }}
              >
                Preencha seus dados para receber o resultado completo.
              </p>

              {/* Step indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {cadastroFields.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === cadastroStep ? 32 : 8,
                      background: i <= cadastroStep ? "#A33722" : "#E8DDD0",
                    }}
                  />
                ))}
              </div>

              {/* Field with transition */}
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: cadastroFieldVisible ? 1 : 0,
                  transform: cadastroFieldVisible ? "translateY(0)" : "translateY(12px)",
                }}
              >
                {(() => {
                  const field = cadastroFields[cadastroStep];
                  const error = formErrors[field.key];
                  return (
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#5C4A3A",
                        }}
                      >
                        {field.label}
                      </label>
                      <input
                        autoFocus
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onKeyDown={handleCadastroKeyDown}
                        className="w-full px-4 py-3.5 rounded-lg border text-lg outline-none transition-colors duration-200"
                        style={{
                          background: "#fff",
                          borderColor: error ? "#C0392B" : "#E8DDD0",
                          color: "#2A1F17",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#A33722")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = error
                            ? "#C0392B"
                            : "#E8DDD0")
                        }
                        placeholder={field.placeholder}
                      />
                      {error && (
                        <p className="mt-1.5" style={{ fontSize: 13, color: "#C0392B" }}>
                          {error}
                        </p>
                      )}

                      <button
                        onClick={handleCadastroNext}
                        className="w-full py-4 mt-6 rounded-lg text-white font-semibold text-base cursor-pointer transition-colors duration-200"
                        style={{ background: "#A33722" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#8B2E1C")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#A33722")
                        }
                      >
                        {cadastroStep < cadastroFields.length - 1
                          ? "Continuar"
                          : "Começar diagnóstico"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </StageWrapper>
        )}

        {/* ── QUIZ ── */}
        {stage === "quiz" && (
          <StageWrapper visible={visible}>
            <div className="pt-6">
              {/* Progress bar */}
              <div className="mb-2">
                <div
                  className="flex justify-between items-center mb-2"
                  style={{ fontSize: 12, color: "#A89888" }}
                >
                  <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
                  <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#E8DDD0" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                      background: "#A33722",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: questionVisible ? 1 : 0,
                  transform: questionVisible
                    ? "translateY(0)"
                    : "translateY(12px)",
                }}
              >
                {(() => {
                  const q = allQuestions[currentQuestion];
                  return (
                    <div className="pt-4">
                      <div
                        className="mb-4"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#A89888",
                        }}
                      >
                        {q.dimensionIcon} {q.dimensionName}
                      </div>

                      <h2
                        className="mb-8"
                        style={{
                          fontFamily: "var(--font-cormorant), serif",
                          fontSize: "clamp(22px, 5vw, 26px)",
                          fontWeight: 600,
                          color: "#2A1F17",
                          lineHeight: 1.3,
                        }}
                      >
                        {q.text}
                      </h2>

                      <div className="space-y-3">
                        {q.options.map((opt) => {
                          const selected = answers[q.key] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleAnswer(opt.value)}
                              className="w-full text-left px-5 py-4 rounded-lg border cursor-pointer transition-all duration-200"
                              style={{
                                background: selected ? "#A33722" : "#fff",
                                borderColor: selected ? "#A33722" : "#E8DDD0",
                                color: selected ? "#fff" : "#2A1F17",
                                fontSize: 15,
                              }}
                              onMouseEnter={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.borderColor = "#A33722";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.borderColor = "#E8DDD0";
                                }
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </StageWrapper>
        )}

        {/* ── LOADING ── */}
        {stage === "loading" && (
          <StageWrapper visible={visible}>
            <div className="flex flex-col items-center justify-center pt-32">
              <div
                className="mb-6"
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #E8DDD0",
                  borderTopColor: "#A33722",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "#5C4A3A",
                }}
              >
                Calculando seu diagnóstico...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </StageWrapper>
        )}

        {/* ── RESULT ── */}
        {stage === "result" && (
          <StageWrapper visible={visible}>
            <div className="pt-6">
              {/* Score header */}
              <div className="text-center mb-8">
                <p
                  className="mb-3"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#A89888",
                  }}
                >
                  Sua nota geral
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    style={{
                      fontFamily: "var(--font-outfit), sans-serif",
                      fontSize: 64,
                      fontWeight: 700,
                      color: level.color,
                      lineHeight: 1,
                    }}
                  >
                    {overall}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-outfit), sans-serif",
                      fontSize: 24,
                      color: "#A89888",
                    }}
                  >
                    /100
                  </span>
                </div>
                <div
                  className="inline-block mt-3 px-4 py-1.5 rounded-full"
                  style={{
                    background: `${level.color}18`,
                    color: level.color,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {level.name}
                </div>
              </div>

              {/* Level description */}
              <p
                className="text-center mb-8"
                style={{
                  fontSize: 15,
                  color: "#5C4A3A",
                  lineHeight: 1.6,
                }}
              >
                {level.desc}
              </p>

              {/* Radar chart */}
              <div className="flex justify-center mb-8">
                <RadarChart scores={scores} />
              </div>

              {/* Dimension bars */}
              <div className="space-y-4 mb-8">
                {DIMENSIONS.map((dim, i) => {
                  const val = scores[dim.id] || 0;
                  return (
                    <div key={dim.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#2A1F17",
                          }}
                        >
                          {dim.icon} {dim.name}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: getBarColor(val),
                          }}
                        >
                          {val}%
                        </span>
                      </div>
                      <ProgressBar
                        value={val}
                        color={getBarColor(val)}
                        delay={i * 100}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Quick reading */}
              <div
                className="p-6 rounded-xl mb-8"
                style={{ background: "#F3EDE4" }}
              >
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#2A1F17",
                  }}
                >
                  Leitura rápida
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#A89888",
                          marginBottom: 2,
                        }}
                      >
                        Ponto forte
                      </p>
                      <p style={{ fontSize: 15, color: "#2A1F17", fontWeight: 500 }}>
                        {strongest.name}{" "}
                        <span style={{ color: "#2E7D32" }}>({strongest.value}%)</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span style={{ fontSize: 18 }}>🚨</span>
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#A89888",
                          marginBottom: 2,
                        }}
                      >
                        Maior gargalo
                      </p>
                      <p style={{ fontSize: 15, color: "#2A1F17", fontWeight: 500 }}>
                        {weakest.name}{" "}
                        <span style={{ color: "#C0392B" }}>({weakest.value}%)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BRIDGE ── */}
              <div className="pt-4 pb-2 mb-8" style={{ borderTop: "1px solid #E8DDD0" }}>
                <p
                  className="mb-3"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#A89888",
                  }}
                >
                  E agora?
                </p>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 26,
                    fontWeight: 700,
                    fontStyle: "italic",
                    color: "#2A1F17",
                    lineHeight: 1.2,
                  }}
                >
                  Diagnóstico sem tratamento é só curiosidade.
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "#5C4A3A",
                    lineHeight: 1.6,
                  }}
                >
                  Você acabou de ver o raio-x do seu negócio. A maioria das pessoas
                  vai olhar, concordar com tudo... e não mudar nada. Se você quer
                  entender por que seu negócio trava — e o que fazer a respeito —
                  esse é o próximo passo.
                </p>
              </div>

              {/* ── OFFER CARD ── */}
              <div
                className="overflow-hidden mb-8"
                style={{ borderRadius: 16 }}
              >
                {/* Gradient top line */}
                <div
                  style={{
                    height: 3,
                    background: "linear-gradient(90deg, #A33722, #D4731A, #A33722)",
                  }}
                />
                <div className="p-6" style={{ background: "#2A1F17" }}>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#FAF6F0",
                      lineHeight: 1.2,
                    }}
                  >
                    O Problema Não É O Seu Funil
                  </h3>
                  <p
                    className="mb-5"
                    style={{
                      fontSize: 14,
                      color: "#B8A898",
                      lineHeight: 1.5,
                    }}
                  >
                    Em menos de 30 minutos, você vai entender o que realmente está
                    travando e como construir algo de verdade.
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-3 mb-6">
                    {[
                      "Por que você continua no mesmo lugar — mesmo comprando curso atrás de curso",
                      "Como identificar seus gargalos reais e parar de jogar dinheiro em soluções erradas",
                      "O passo a passo pra sair de 'dono de produto' pra dono de negócio",
                      "Metodologia testada em dezenas de negócios nos últimos 3 anos",
                    ].map((text, i) => (
                      <div key={i} className="flex gap-3">
                        <span
                          className="shrink-0 mt-0.5"
                          style={{
                            color: "#A33722",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          →
                        </span>
                        <p style={{ fontSize: 14, color: "#D4C8BA", lineHeight: 1.5 }}>
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="text-center mb-5">
                    <span
                      style={{
                        fontFamily: "var(--font-outfit), sans-serif",
                        fontSize: 36,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      R$ 47
                    </span>
                    <p className="mt-1" style={{ fontSize: 12, color: "#A89888" }}>
                      ou 11× de R$ 5,06 · Acesso imediato · Garantia de 7 dias
                    </p>
                  </div>

                  {/* CTA Button */}
                  <a
                    href="https://funil.somosintegros.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 rounded-lg text-white font-semibold text-base text-center cursor-pointer transition-colors duration-200"
                    style={{ background: "#A33722" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#8B2E1C")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#A33722")
                    }
                  >
                    Assistir à aula →
                  </a>

                  {/* Guarantee */}
                  <p
                    className="text-center mt-4"
                    style={{ fontSize: 12, color: "#A89888", lineHeight: 1.5 }}
                  >
                    Se em 7 dias você sentir que não valeu, devolvemos 100%.
                    Sem perguntas.
                  </p>
                </div>
              </div>

              {/* Refazer diagnóstico */}
              <button
                onClick={() => {
                  setAnswers({});
                  setScores({});
                  setOverall(0);
                  setCurrentQuestion(0);
                  setQuestionVisible(true);
                  setCadastroStep(0);
                  setCadastroFieldVisible(true);
                  setNome("");
                  setEmail("");
                  setWhatsapp("");
                  setFormErrors({});
                  transition("intro");
                }}
                className="w-full py-3 rounded-lg text-center cursor-pointer transition-colors duration-200"
                style={{
                  background: "transparent",
                  border: "1px solid #E8DDD0",
                  color: "#A89888",
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#A33722";
                  e.currentTarget.style.color = "#A33722";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E8DDD0";
                  e.currentTarget.style.color = "#A89888";
                }}
              >
                Refazer diagnóstico
              </button>
            </div>
          </StageWrapper>
        )}
      </div>

      <Footer />
    </div>
  );
}

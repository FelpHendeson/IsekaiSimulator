"use client";

import clsx from "clsx";
import {
  Clock3,
  Coins,
  Dumbbell,
  FolderOpen,
  Heart,
  LogIn,
  LogOut,
  Moon,
  Save,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sceneDefinitions } from "../../content/scenes/definitions";
import { trainingDefinitions } from "../../content/training/definitions";
import { applyGameAction } from "../../game/core/apply-action";
import { GameRuleError } from "../../game/core/errors";
import { createInitialGameState } from "../../game/core/initial-state";
import { getCurrentScene, isChoiceAvailable } from "../../game/narrative/scenes";
import { formatClock } from "../../game/time/clock";
import type { GameState, SceneChoice, SceneDefinition, TrainingSession } from "../../game/types";
import { getEffectiveDanger } from "../../game/world/danger";

type AuthUser = {
  id: string;
  username: string;
  displayName: string;
};

export function GameShell() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [message, setMessage] = useState("Voce desperta em Elaria enquanto o mundo segue seu proprio relogio.");
  const [now, setNow] = useState(() => new Date());
  const [isPersisting, setIsPersisting] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMessage, setAuthMessage] = useState("Entre para salvar e carregar por conta.");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
        const payload = await response.json();

        if (response.ok && payload.user) {
          setCurrentUser(payload.user);
          setAuthMessage(`Sessao ativa: ${payload.user.displayName}.`);
        } else if (!response.ok && payload.error) {
          setAuthMessage(payload.error);
        }
      } catch {
        setAuthMessage("Nao foi possivel consultar a sessao.");
      }
    }

    void loadSession();
  }, []);

  const currentLocation = gameState.world.locations[gameState.currentLocationId];
  const effectiveDanger = currentLocation
    ? getEffectiveDanger(currentLocation, gameState.clock)
    : 0;
  const activeTraining = gameState.activeTrainingSessions[0];
  const currentScene = getCurrentScene(gameState, sceneDefinitions);

  function runAction(action: Parameters<typeof applyGameAction>[1], successMessage: string) {
    try {
      setGameState((current) => applyGameAction(current, action, { now, devMode }));
      setMessage(successMessage);
    } catch (error) {
      if (error instanceof GameRuleError) {
        setMessage(error.message);
        return;
      }

      setMessage("Algo inesperado aconteceu ao processar a acao.");
    }
  }

  async function saveGame() {
    if (!currentUser) {
      setMessage("Faca login para salvar esta campanha em uma conta.");
      return;
    }

    setIsPersisting(true);

    try {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameState),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "Nao foi possivel salvar a partida.");
        return;
      }

      setMessage(`Partida salva em ${new Date(payload.save.updatedAt).toLocaleString("pt-BR")}.`);
    } catch {
      setMessage("Nao foi possivel conectar ao servidor de save.");
    } finally {
      setIsPersisting(false);
    }
  }

  async function loadGame() {
    if (!currentUser) {
      setMessage("Faca login para carregar saves da sua conta.");
      return;
    }

    setIsPersisting(true);

    try {
      const response = await fetch(`/api/saves?saveId=${encodeURIComponent(gameState.saveId)}`);
      const payload = await response.json();

      if (response.status === 404) {
        setMessage("Nenhum save encontrado para esta campanha.");
        return;
      }

      if (!response.ok) {
        setMessage(payload.error ?? "Nao foi possivel carregar a partida.");
        return;
      }

      setGameState(payload.save.gameState);
      setMessage("Partida carregada do MongoDB Atlas.");
    } catch {
      setMessage("Nao foi possivel conectar ao servidor de save.");
    } finally {
      setIsPersisting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <HeaderPanel
            clockLabel={formatClock(gameState.clock)}
            period={gameState.clock.period}
            locationName={currentLocation?.name ?? "Local desconhecido"}
            danger={effectiveDanger}
            devMode={devMode}
            isPersisting={isPersisting}
            canPersist={Boolean(currentUser)}
            onLoad={loadGame}
            onSave={saveGame}
          />

          <NarrativePanel
            gameState={gameState}
            message={message}
            scene={currentScene}
            onChoose={(choice) =>
              runAction(
                { type: "CHOOSE_SCENE_OPTION", optionId: choice.id },
                `Escolha registrada: ${choice.label}`,
              )
            }
          />

          <TrainingPanel
            activeTraining={activeTraining}
            devMode={devMode}
            now={now}
            onClaim={(sessionId) =>
              runAction(
                { type: "CLAIM_TRAINING", trainingSessionId: sessionId },
                "Treino concluido. O corpo esta mais forte, mas o cansaco cobrou seu preco.",
              )
            }
            onStart={(trainingId) =>
              runAction(
                { type: "START_TRAINING", trainingId },
                "Treino iniciado. O personagem ficara ocupado ate o timer real terminar.",
              )
            }
          />
        </div>

        <aside className="space-y-4">
          <AuthPanel
            authMessage={authMessage}
            currentUser={currentUser}
            isLoading={isAuthLoading}
            onAuth={async (mode, username, password) => {
              setIsAuthLoading(true);

              try {
                const response = await fetch(`/api/auth/${mode}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ username, password }),
                });
                const payload = await response.json();

                if (!response.ok) {
                  setAuthMessage(payload.error ?? "Nao foi possivel autenticar.");
                  return;
                }

                setCurrentUser(payload.user);
                setAuthMessage(`Conta ativa: ${payload.user.displayName}.`);
              } catch {
                setAuthMessage("Nao foi possivel conectar ao servidor de auth.");
              } finally {
                setIsAuthLoading(false);
              }
            }}
            onLogout={async () => {
              setIsAuthLoading(true);

              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } finally {
                setCurrentUser(null);
                setAuthMessage("Sessao encerrada.");
                setIsAuthLoading(false);
              }
            }}
          />
          <CharacterPanel gameState={gameState} />
          <WorldPanel gameState={gameState} danger={effectiveDanger} />
          <RestPanel
            onSleep={() =>
              runAction(
                { type: "SLEEP", hours: 8 },
                "Voce dorme por 8 horas. A stamina volta, a fadiga cai e o mundo continua avancando.",
              )
            }
          />
        </aside>
      </section>
    </main>
  );
}

function HeaderPanel({
  canPersist,
  clockLabel,
  danger,
  devMode,
  isPersisting,
  locationName,
  onLoad,
  onSave,
  period,
}: {
  canPersist: boolean;
  clockLabel: string;
  danger: number;
  devMode: boolean;
  isPersisting: boolean;
  locationName: string;
  onLoad: () => void;
  onSave: () => void;
  period: string;
}) {
  return (
    <section className="rounded border border-ink/15 bg-parchment/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">isekaiSimulator</h1>
          <p className="mt-1 text-sm text-ink/65">{locationName}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <StatusPill icon={<Clock3 size={16} />} label={clockLabel} />
          <StatusPill label={periodLabel(period)} />
          <StatusPill icon={<ShieldAlert size={16} />} label={`Perigo ${danger}`} tone="danger" />
          {devMode ? <StatusPill label="DEV mode" tone="dev" /> : null}
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded border border-ink/15 bg-white/70 px-3 py-2 font-semibold text-ink transition hover:border-ink/35 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPersisting || !canPersist}
            onClick={onSave}
            title="Salvar partida"
          >
            <Save size={16} />
            Salvar
          </button>
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded border border-ink/15 bg-white/70 px-3 py-2 font-semibold text-ink transition hover:border-ink/35 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPersisting || !canPersist}
            onClick={onLoad}
            title="Carregar partida"
          >
            <FolderOpen size={16} />
            Carregar
          </button>
        </div>
      </div>
    </section>
  );
}

function AuthPanel({
  authMessage,
  currentUser,
  isLoading,
  onAuth,
  onLogout,
}: {
  authMessage: string;
  currentUser: AuthUser | null;
  isLoading: boolean;
  onAuth: (mode: "login" | "register", username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAuth(mode, username, password);
    setPassword("");
  }

  return (
    <section className="rounded border border-ink/15 bg-white/70 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Conta</h2>
          <p className="mt-1 text-sm text-ink/65">Saves ficam separados por usuario.</p>
        </div>
        {currentUser ? <LogOut className="text-ember" size={22} /> : <LogIn className="text-ember" size={22} />}
      </div>

      {currentUser ? (
        <div className="mt-4">
          <div className="rounded bg-moss/10 p-4 text-sm">
            <p className="font-semibold text-ink">{currentUser.displayName}</p>
            <p className="mt-1 text-ink/60">@{currentUser.username}</p>
          </div>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-ink/20 px-4 py-3 text-sm font-semibold text-ink transition hover:border-ink/45 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            onClick={onLogout}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={submitAuth}>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={clsx(
                "rounded border px-3 py-2 text-sm font-semibold transition",
                mode === "login"
                  ? "border-ink bg-ink text-parchment"
                  : "border-ink/15 bg-white/50 text-ink",
              )}
              onClick={() => setMode("login")}
              type="button"
            >
              Entrar
            </button>
            <button
              className={clsx(
                "rounded border px-3 py-2 text-sm font-semibold transition",
                mode === "register"
                  ? "border-ink bg-ink text-parchment"
                  : "border-ink/15 bg-white/50 text-ink",
              )}
              onClick={() => setMode("register")}
              type="button"
            >
              Criar
            </button>
          </div>
          <label className="block text-sm font-semibold text-ink/75">
            Usuario
            <input
              className="mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-ink outline-none transition focus:border-ember"
              maxLength={32}
              minLength={3}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="aventureiro"
              required
              value={username}
            />
          </label>
          <label className="block text-sm font-semibold text-ink/75">
            Senha
            <input
              className="mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2 text-ink outline-none transition focus:border-ember"
              maxLength={128}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="minimo 6 caracteres"
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-parchment transition hover:bg-night disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            type="submit"
          >
            {mode === "register" ? <UserPlus size={16} /> : <LogIn size={16} />}
            {mode === "register" ? "Criar conta" : "Entrar"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm leading-6 text-ink/65">{authMessage}</p>
    </section>
  );
}

function NarrativePanel({
  gameState,
  message,
  onChoose,
  scene,
}: {
  gameState: GameState;
  message: string;
  onChoose: (choice: SceneChoice) => void;
  scene?: SceneDefinition;
}) {
  return (
    <section className="rounded border border-ink/15 bg-white/70 p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-ember">Cena atual</p>
      <h2 className="mt-3 text-2xl font-bold text-ink">{scene?.title ?? "Sem cena ativa"}</h2>
      <p className="mt-4 text-lg leading-8 text-ink/80">
        {scene?.text ?? "O estado atual nao aponta para uma cena valida."}
      </p>
      <div className="mt-5 rounded bg-night px-4 py-3 text-sm leading-6 text-parchment">
        {message}
      </div>

      {scene ? (
        <div className="mt-5 grid gap-3">
          {scene.choices.map((choice) => {
            const available = isChoiceAvailable(gameState, choice);

            return (
              <button
                className={clsx(
                  "rounded border p-4 text-left transition",
                  available
                    ? "border-ink/15 bg-parchment/85 hover:border-ember/60 hover:bg-parchment"
                    : "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/40",
                )}
                disabled={!available}
                key={choice.id}
                onClick={() => onChoose(choice)}
              >
                <span className="block font-semibold">{choice.label}</span>
                <span className="mt-1 block text-sm text-ink/60">
                  {choice.timeCostMinutes ? `${choice.timeCostMinutes} min no mundo` : "Sem custo de tempo"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function TrainingPanel({
  activeTraining,
  devMode,
  now,
  onClaim,
  onStart,
}: {
  activeTraining?: TrainingSession;
  devMode: boolean;
  now: Date;
  onClaim: (sessionId: string) => void;
  onStart: (trainingId: string) => void;
}) {
  const remainingMs = activeTraining
    ? Math.max(0, new Date(activeTraining.finishesAtIso).getTime() - now.getTime())
    : 0;
  const canClaim = Boolean(activeTraining && (remainingMs === 0 || devMode));
  const activeDefinition = useMemo(
    () => trainingDefinitions.find((training) => training.id === activeTraining?.trainingId),
    [activeTraining],
  );

  return (
    <section className="rounded border border-ink/15 bg-parchment/90 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Treino</h2>
          <p className="mt-1 text-sm text-ink/65">Melhorias levam tempo real e tempo do mundo.</p>
        </div>
        <Dumbbell className="text-ember" size={24} />
      </div>

      {activeTraining ? (
        <div className="mt-5 rounded border border-ember/30 bg-ember/10 p-4">
          <p className="font-semibold text-ink">{activeDefinition?.name ?? activeTraining.trainingId}</p>
          <p className="mt-2 text-sm text-ink/70">
            {devMode ? "DEV mode ativo: pode resgatar sem esperar. " : ""}
            Termina em {formatRemaining(remainingMs)}. Ao resgatar, o mundo avanca{" "}
            {activeTraining.worldTimeAdvanceMinutes / 60} horas.
          </p>
          <button
            className={clsx(
              "mt-4 flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-semibold transition",
              canClaim
                ? "bg-ink text-parchment hover:bg-night"
                : "cursor-not-allowed bg-ink/15 text-ink/45",
            )}
            disabled={!canClaim}
            onClick={() => onClaim(activeTraining.id)}
          >
            <Sparkles size={16} />
            {devMode && remainingMs > 0 ? "Resgatar agora" : "Resgatar treino"}
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {trainingDefinitions.map((training) => (
            <button
              className="rounded border border-ink/15 bg-white/60 p-4 text-left transition hover:border-ember/60 hover:bg-white"
              key={training.id}
              onClick={() => onStart(training.id)}
            >
              <span className="block font-semibold text-ink">{training.name}</span>
              <span className="mt-2 block text-sm leading-6 text-ink/65">
                {training.realDurationMinutes} min reais,{" "}
                {training.worldTimeAdvanceMinutes / 60}h no mundo, {training.staminaCost} stamina
                {training.goldCost ? `, ${training.goldCost} ouro` : ""}.
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CharacterPanel({ gameState }: { gameState: GameState }) {
  const { player } = gameState;
  const stats = [
    ["FOR", player.stats.strength],
    ["AGI", player.stats.agility],
    ["VIT", player.stats.vitality],
    ["INT", player.stats.intelligence],
    ["SAB", player.stats.wisdom],
    ["CAR", player.stats.charisma],
    ["SOR", player.stats.luck],
  ];

  return (
    <section className="rounded border border-ink/15 bg-white/70 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">Personagem</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <Meter icon={<Heart size={16} />} label="Vida" value={player.hp} max={player.maxHp} />
        <Meter icon={<Zap size={16} />} label="Stamina" value={player.energy.stamina} max={player.energy.maxStamina} />
        <Meter label="Fadiga" value={player.energy.fatigue} max={100} inverted />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <StatusPill icon={<Coins size={16} />} label={`${player.gold} ouro`} />
        <StatusPill label={`Nivel ${player.level}`} />
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {stats.map(([label, value]) => (
          <div className="rounded bg-ink/5 px-3 py-2 text-center" key={label}>
            <p className="text-xs font-semibold text-ink/50">{label}</p>
            <p className="mt-1 text-lg font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorldPanel({ danger, gameState }: { danger: number; gameState: GameState }) {
  const location = gameState.world.locations[gameState.currentLocationId];

  return (
    <section className="rounded border border-ink/15 bg-white/70 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">Mundo</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <InfoRow label="Local" value={location?.name ?? "-"} />
        <InfoRow label="Periodo" value={periodLabel(gameState.clock.period)} />
        <InfoRow label="Perigo efetivo" value={String(danger)} />
        <InfoRow label="Treinos ativos" value={String(gameState.activeTrainingSessions.length)} />
      </dl>
    </section>
  );
}

function RestPanel({ onSleep }: { onSleep: () => void }) {
  return (
    <section className="rounded border border-ink/15 bg-white/70 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">Descanso</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Dormir recupera stamina, reduz fadiga e avanca o relogio do mundo.
      </p>
      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-moss px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss/85"
        onClick={onSleep}
      >
        <Moon size={16} />
        Dormir 8h
      </button>
    </section>
  );
}

function StatusPill({
  icon,
  label,
  tone = "default",
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: "default" | "danger" | "dev";
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-9 items-center gap-2 rounded border px-3 py-2 font-semibold",
        tone === "danger" && "border-ember/35 bg-ember/10 text-ember",
        tone === "dev" && "border-steel/35 bg-steel/10 text-steel",
        tone === "default" && "border-ink/15 bg-white/60 text-ink",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function Meter({
  icon,
  inverted = false,
  label,
  max,
  value,
}: {
  icon?: React.ReactNode;
  inverted?: boolean;
  label: string;
  max: number;
  value: number;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = inverted ? 100 - percent : percent;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold text-ink/75">
          {icon}
          {label}
        </span>
        <span className="text-ink/60">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 rounded bg-ink/10">
        <div className="h-2 rounded bg-ember" style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink/55">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function periodLabel(period: string): string {
  const labels: Record<string, string> = {
    dawn: "Amanhecer",
    morning: "Manha",
    afternoon: "Tarde",
    evening: "Anoitecer",
    night: "Noite",
    late_night: "Madrugada",
  };

  return labels[period] ?? period;
}

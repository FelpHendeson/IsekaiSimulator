export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-between gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded border border-ink/15 bg-parchment/85 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-ember">
              Dia 1, 07:30 - Manha
            </p>
            <h1 className="mt-4 text-4xl font-bold text-ink">isekaiSimulator</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/80">
              Voce desperta em uma vila desconhecida depois de uma morte que nao
              consegue lembrar por completo. O mundo segue seu proprio relogio:
              lojas abrem, NPCs somem, monstros mudam de comportamento e cada
              treino cobra tempo, stamina e descanso.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button className="rounded bg-ink px-4 py-3 text-sm font-semibold text-parchment transition hover:bg-night">
                Comecar jornada
              </button>
              <button className="rounded border border-ink/20 px-4 py-3 text-sm font-semibold text-ink transition hover:border-ink/45">
                Ver personagem
              </button>
              <button className="rounded border border-ink/20 px-4 py-3 text-sm font-semibold text-ink transition hover:border-ink/45">
                Plano do jogo
              </button>
            </div>
          </div>

          <aside className="rounded border border-ink/15 bg-white/60 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Estado inicial</h2>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink/55">Nivel</dt>
                <dd className="mt-1 font-semibold text-ink">1</dd>
              </div>
              <div>
                <dt className="text-ink/55">Ouro</dt>
                <dd className="mt-1 font-semibold text-ink">15</dd>
              </div>
              <div>
                <dt className="text-ink/55">Vida</dt>
                <dd className="mt-1 font-semibold text-ink">30 / 30</dd>
              </div>
              <div>
                <dt className="text-ink/55">Stamina</dt>
                <dd className="mt-1 font-semibold text-ink">40 / 40</dd>
              </div>
            </dl>
            <div className="mt-6 rounded bg-moss/10 p-4 text-sm leading-6 text-ink/75">
              Proxima etapa: conectar esta tela ao motor de cenas, relogio e
              salvamento no MongoDB.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

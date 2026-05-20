# isekaiSimulator - Plano de Execucao

## Visao geral

`isekaiSimulator` sera um RPG inspirado em animes, mangas e manhwas de isekai: morte ou transicao inicial, reencarnacao em um novo mundo, liberdade de escolha, evolucao de personagem, combate por turnos, interacao com NPCs, itens, conquistas, eventos narrativos e consequencias persistentes.

A ideia central e criar um jogo com sensacao de RPG de mesa: o jogador recebe situacoes, escolhe como agir, conversa com personagens, aceita ou ignora missoes, explora locais, vence ou perde combates e molda sua propria historia.

O projeto deve separar bem duas coisas:

- **Motor do jogo:** regras, combate, inventario, progressao, NPCs, conquistas, salvamento e validacoes.
- **Conteudo do jogo:** cenas, itens, inimigos, classes, locais, eventos, missoes, dialogos e textos narrativos.

Essa separacao permite criar muito conteudo sem reescrever a base do jogo.

## Stack proposta

A stack sugerida para a primeira versao:

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS.
- **Backend:** API Routes ou Route Handlers do Next.js.
- **Banco de dados:** MongoDB Atlas.
- **ORM/ODM:** Mongoose ou driver oficial do MongoDB.
- **Validacao:** Zod.
- **Autenticacao:** NextAuth/Auth.js em uma fase posterior.
- **Testes:** Vitest para regras de jogo e Playwright para fluxos principais.

Motivo da escolha:

- TypeScript ajuda a manter as regras do RPG organizadas.
- Next.js permite criar interface e API no mesmo projeto.
- MongoDB combina bem com dados flexiveis de RPG, como personagens, saves, inventarios, flags, dialogos e eventos.
- A logica principal pode ficar isolada em modulos puros, sem depender diretamente do React ou do banco.

## Estrutura inicial sugerida

```txt
isekaiSimulator/
  docs/
    isekaiSimulator-plano.md
  src/
    app/
      page.tsx
      api/
        game/
        saves/
        auth/
    components/
      game/
      ui/
    server/
      db/
      repositories/
      services/
    game/
      core/
      combat/
      progression/
      inventory/
      narrative/
      npc/
      achievements/
      world/
      time/
      training/
      economy/
      quests/
      random/
      types/
    content/
      items/
      enemies/
      classes/
      scenes/
      npcs/
      locations/
      schedules/
      training/
      achievements/
```

## Modelo de jogo

O jogador controla um personagem que possui:

- Identidade: nome, origem, titulo, reputacao.
- Atributos: forca, agilidade, vitalidade, inteligencia, sabedoria, carisma, sorte.
- Recursos: vida, mana, stamina, dinheiro, fome, moral ou sanidade, caso o jogo use sobrevivencia.
- Classe ou caminho: guerreiro, mago, ladino, curandeiro, invocador, nobre, mercador, etc.
- Habilidades: ataques, magias, pericias sociais, tecnicas passivas.
- Inventario: itens consumiveis, armas, armaduras, materiais, artefatos e itens de quest.
- Relacoes: afinidade com NPCs, faccoes, cidades e grupos.
- Historico: escolhas importantes, flags de historia, missoes concluidas, mortes, conquistas e titulos.

O jogo deve ser orientado por um `GameState`, que representa o estado atual da partida.

Exemplo conceitual:

```ts
type GameState = {
  saveId: string;
  currentLocationId: string;
  currentSceneId?: string;
  clock: GameClockState;
  player: PlayerState;
  world: WorldState;
  inventory: InventoryState;
  quests: QuestState[];
  flags: Record<string, boolean | string | number>;
  achievements: string[];
};
```

## Modulo: Core do jogo

Responsabilidade:

- Controlar o estado global da partida.
- Aplicar comandos do jogador.
- Validar se uma acao e permitida.
- Atualizar o estado apos cada escolha, combate ou evento.
- Garantir que as regras sejam previsiveis e testaveis.

O jogador nao altera o estado diretamente. Ele envia uma acao:

```ts
type GameAction =
  | { type: "CHOOSE_SCENE_OPTION"; optionId: string }
  | { type: "START_COMBAT"; enemyGroupId: string }
  | { type: "USE_ITEM"; itemId: string; targetId?: string }
  | { type: "TALK_TO_NPC"; npcId: string; dialogOptionId: string }
  | { type: "TRAVEL"; locationId: string }
  | { type: "START_TRAINING"; trainingId: string }
  | { type: "CLAIM_TRAINING"; trainingSessionId: string }
  | { type: "SLEEP"; hours: number };
```

O core recebe a acao, processa as regras e devolve um novo estado.

## Modulo: Narrativa e escolhas

Responsabilidade:

- Renderizar cenas.
- Listar escolhas disponiveis.
- Aplicar consequencias.
- Usar flags para alterar eventos futuros.
- Permitir eventos condicionais.

Uma cena pode ter escolhas simples, requisitos e efeitos:

```ts
type SceneChoice = {
  id: string;
  label: string;
  requirements?: Requirement[];
  effects?: Effect[];
  nextSceneId?: string;
};
```

Exemplo de uso:

- Se o jogador salvou um mercador, ganha desconto no futuro.
- Se roubou uma loja, a cidade pode ficar hostil.
- Se morreu e reencarnou, pode manter um titulo raro ou uma memoria fragmentada.

## Modulo: Liberdade do jogador

Para dar sensacao de liberdade, o jogo precisa evitar uma historia totalmente linear.

Sistemas importantes:

- **Mapa de locais:** vilas, masmorras, florestas, reinos, guildas, templos e regioes perigosas.
- **Eventos dinamicos:** encontros aleatorios, rumores, emboscadas, oportunidades e crises locais.
- **Faccoes:** guilda dos aventureiros, reino, igreja, demonios, comerciantes, nobres, rebeldes.
- **Consequencias:** reputacao, precos, aliados, inimigos, acesso a missoes e finais.
- **Objetivos paralelos:** o jogador pode seguir a historia principal, viver como mercador, virar aventureiro, buscar poder, proteger uma cidade ou tentar voltar ao mundo original.

A liberdade nao precisa significar mundo infinito. Ela pode ser criada com decisoes relevantes, varias rotas e sistemas que reagem ao jogador.

## Modulo: Mundo e exploracao

Responsabilidade:

- Controlar locais disponiveis.
- Gerar eventos de viagem.
- Definir risco por regiao.
- Controlar recursos de exploracao.
- Liberar novas areas por nivel, reputacao, item ou escolha.

Cada local pode conter:

- NPCs.
- Lojas.
- Eventos.
- Entradas de masmorra.
- Missoes.
- Inimigos possiveis.
- Requisitos de acesso.

Exemplo:

```ts
type Location = {
  id: string;
  name: string;
  type: "village" | "city" | "dungeon" | "forest" | "castle" | "temple";
  dangerLevel: number;
  dangerByTime?: Partial<Record<TimePeriod, number>>;
  openHours?: TimeWindow[];
  connectedLocations: string[];
  npcIds: string[];
  eventPoolIds: string[];
};
```

## Modulo: Tempo, rotina e energia

Responsabilidade:

- Controlar calendario, horario e passagem de tempo dentro do mundo.
- Alterar perigo, eventos, NPCs, lojas e missoes conforme o horario.
- Definir custo temporal de acoes como viajar, treinar, dormir, trabalhar, explorar e descansar.
- Controlar stamina, fadiga e necessidade de sono.
- Permitir acoes que levam tempo real, como treinos longos e melhorias.

O jogo deve ter dois conceitos separados:

- **Tempo do mundo:** relogio interno do save, usado por NPCs, eventos, perigo e narrativa.
- **Tempo real:** relogio do servidor, usado para timers de treino, melhorias e espera offline.

Exemplo de estado do relogio:

```ts
type TimePeriod = "dawn" | "morning" | "afternoon" | "evening" | "night" | "late_night";

type GameClockState = {
  day: number;
  hour: number;
  minute: number;
  period: TimePeriod;
  season?: "spring" | "summer" | "autumn" | "winter";
};
```

Cada acao importante pode avancar o tempo do mundo:

- Conversa simples: 5 a 15 minutos.
- Comprar ou vender itens: 10 a 30 minutos.
- Viajar entre locais proximos: 30 a 120 minutos.
- Explorar uma area: 1 a 4 horas.
- Entrar em masmorra: 2 a 8 horas.
- Dormir: 6 a 10 horas.
- Treinar intensamente: pode consumir varias horas do mundo.

O horario deve mudar o jogo de forma concreta:

- Florestas e estradas ficam mais perigosas a noite.
- Alguns monstros aparecem apenas de madrugada.
- Guardas, comerciantes e treinadores seguem rotinas.
- Missoes urgentes podem expirar depois de certo horario.
- NPCs podem estar em casa, na loja, na taverna, na igreja ou fora da cidade dependendo da hora.
- Eventos raros podem depender de lua, noite, chuva, festival ou dia especifico.

Exemplo de modificador de perigo:

```ts
type DangerRule = {
  locationId: string;
  period: TimePeriod;
  dangerModifier: number;
  encounterTags?: string[];
};
```

Exemplo:

- Vila durante o dia: perigo baixo.
- Vila de madrugada: risco medio por ladroes e eventos suspeitos.
- Floresta durante o dia: risco medio.
- Floresta a noite: risco alto, mais inimigos sombrios.
- Masmorra antiga de madrugada: chance maior de mortos-vivos.

Stamina e fadiga:

```ts
type EnergyState = {
  stamina: number;
  maxStamina: number;
  fatigue: number;
  sleepDebt: number;
};
```

Regras sugeridas:

- Acoes fisicas consomem stamina.
- Treino consome bastante stamina e aumenta fadiga.
- Ficar muitas horas acordado reduz precisao, defesa, carisma e ganho de treino.
- Dormir recupera stamina, reduz fadiga e avanca o relogio.
- Pouca stamina pode bloquear treino pesado, viagem longa e combate voluntario.
- Excesso de fadiga pode forcar descanso ou aplicar penalidades graves.

## Modulo: Treino e progressao por tempo

Responsabilidade:

- Permitir que o jogador escolha treinos no menu do personagem.
- Aplicar ganhos graduais em atributos, pericias e habilidades.
- Consumir stamina, dinheiro, materiais ou acesso a instrutor.
- Avancar o tempo do mundo quando o treino termina.
- Usar timers reais para criar expectativa e progressao offline.

Esse sistema funciona como melhorias de jogos de construcao, mas aplicado ao personagem.

Exemplo:

- Treino de forca.
- Duracao real: 30 minutos.
- Avanco no mundo: 12 horas.
- Custo: 60 stamina, 20 moedas se usar academia ou instrutor.
- Recompensa: progresso em forca, ataque fisico, resistencia e carga maxima.
- Penalidade: aumenta fadiga e pode exigir sono depois.

Modelo de definicao:

```ts
type TrainingDefinition = {
  id: string;
  name: string;
  realDurationMinutes: number;
  worldTimeAdvanceMinutes: number;
  staminaCost: number;
  fatigueGain: number;
  goldCost?: number;
  requiredLocationTags?: string[];
  requiredNpcId?: string;
  rewards: TrainingReward[];
};
```

Sessao em andamento:

```ts
type TrainingSession = {
  id: string;
  trainingId: string;
  startedAt: Date;
  finishesAt: Date;
  claimedAt?: Date;
  worldTimeAdvanceMinutes: number;
  staminaCost: number;
};
```

Fluxo:

```txt
Jogador abre menu de personagem
Escolhe treino disponivel
Sistema valida stamina, local, dinheiro e requisitos
Sistema cria uma TrainingSession com startedAt e finishesAt
Ao terminar no tempo real, jogador resgata o treino
Sistema avanca o relogio do mundo
Sistema aplica ganhos e fadiga
Sistema verifica conquistas, nivel e eventos gerados pelo tempo
```

Regras importantes:

- O timer deve ser salvo no MongoDB com `startedAt` e `finishesAt`.
- Se o jogador fechar o jogo, o treino ainda pode terminar porque o servidor compara timestamps.
- O ganho nao deve ser aplicado ao iniciar, mas ao resgatar o treino.
- Treinos longos devem gerar consequencias no mundo, porque o personagem passou horas ocupado.
- Se uma missao expira durante o treino, ela deve falhar ou mudar de estado.
- NPCs e lojas devem ser recalculados depois do avanco de horario.

Exemplos de treinos:

```txt
Treino de Forca
- Aumenta ataque fisico, resistencia e carga maxima.
- Custa muita stamina.
- Melhor em quartel, academia ou com instrutor.

Meditacao Arcana
- Aumenta mana maxima, controle magico e resistencia mental.
- Custa pouca stamina, mas consome tempo.
- Melhor em templo, torre magica ou lugar silencioso.

Corrida de Resistencia
- Aumenta stamina maxima, esquiva e velocidade.
- Custa stamina e gera fadiga.
- Pode ser afetada por clima e horario.

Estudo Tatico
- Aumenta inteligencia, chance critica estrategica e leitura de inimigos.
- Custa pouco fisicamente, mas pode gerar fadiga mental.
- Pode exigir livros, mentor ou biblioteca.
```

## Modulo: Combate por turnos

Responsabilidade:

- Controlar ordem dos turnos.
- Processar ataques, habilidades, magias, defesa, itens e fuga.
- Aplicar status, buffs e debuffs.
- Calcular dano, cura, chance de acerto, critico e recompensas.

Modelo recomendado:

- Combate por turnos com iniciativa.
- Cada turno oferece acoes como atacar, habilidade, item, defender, negociar ou fugir.
- Inimigos tambem possuem intencoes: atacar, defender, preparar golpe, curar, invocar, fugir.
- Status alteram o comportamento: veneno, queimadura, sangramento, atordoamento, medo, inspiracao, barreira.

Fluxo:

```txt
Inicio do combate
Calcular iniciativa
Turno da entidade atual
Escolher acao
Resolver efeitos
Aplicar status de fim de turno
Verificar vitoria, derrota ou fuga
Avancar para o proximo turno
```

O combate deve gerar um log narrativo:

```txt
Você usa Corte Ascendente.
O Lobo Sombrio sofre 12 de dano.
O Lobo Sombrio esta sangrando.
```

Isso ajuda o jogo a parecer RPG de mesa.

## Modulo: Evolucao e niveis

Responsabilidade:

- Controlar experiencia.
- Subir nivel.
- Liberar habilidades.
- Melhorar atributos.
- Aplicar titulos, classes e especializacoes.

Sistemas recomendados:

- **Nivel tradicional:** XP acumulado libera novos niveis.
- **Pericias por uso:** usar espada melhora espada; negociar melhora persuasao.
- **Treino por tempo:** atributos e pericias tambem podem evoluir por sessoes de treino.
- **Titulos:** "Matador de Slimes", "Abençoado pela Deusa", "Inimigo do Reino".
- **Arvores de habilidade:** combate, magia, social, sobrevivencia, producao.
- **Evolucao por escolhas:** o personagem se transforma conforme joga.

Exemplo:

- Jogador resolve muitos conflitos por dialogo: ganha pericias sociais.
- Jogador vence monstros sozinho: ganha titulo de coragem ou imprudencia.
- Jogador usa magia proibida: ganha poder, mas perde reputacao com a igreja.
- Jogador treina forca por varios dias: ganha ataque e resistencia, mas precisa administrar sono e stamina.

## Modulo: Classes, caminhos e reencarnacao

Responsabilidade:

- Definir origem inicial.
- Aplicar bonus de reencarnacao.
- Liberar caminhos narrativos.
- Controlar vantagens e desvantagens.

Exemplos de origens:

- Estudante comum.
- Programador.
- Soldado.
- Medico.
- Criminoso.
- Nobre falido.
- Herdeiro de linhagem magica.
- Invocado como heroi.
- Reencarnado como plebeu.

Exemplos de vantagens:

- Memoria do mundo anterior.
- Sistema de status.
- Afinidade elemental.
- Sorte absurda.
- Corpo fraco, mas mente brilhante.
- Talento para alquimia.
- Capacidade de copiar habilidades.

A reencarnacao pode funcionar como criacao de personagem e tambem como mecanica de progressao em caso de morte.

## Modulo: NPCs e relacoes

Responsabilidade:

- Controlar dialogos.
- Guardar afinidade.
- Reagir a reputacao, classe, titulos e escolhas.
- Oferecer missoes, comercio, treinamento ou traicao.

Cada NPC deve ter:

- Personalidade.
- Objetivos.
- Facção.
- Relacao com o jogador.
- Memoria de eventos relevantes.
- Dialogos condicionais.
- Agenda por horario e local.

Exemplo:

```ts
type NpcState = {
  npcId: string;
  relationship: number;
  trust: number;
  fear: number;
  knownPlayerActions: string[];
};
```

Exemplo de agenda:

```ts
type NpcScheduleRule = {
  npcId: string;
  period: TimePeriod;
  locationId: string;
  availableInteractions: string[];
};
```

Exemplos:

- Ferreiro trabalha de manha e tarde, vai para a taverna a noite e dorme de madrugada.
- Sacerdotisa atende no templo de manha, visita doentes a tarde e nao aceita missoes a noite.
- Informante aparece apenas na taverna depois das 22:00.
- Treinador militar libera treino de forca apenas no quartel durante o dia.

Interacoes possiveis:

- Conversar.
- Persuadir.
- Intimidar.
- Negociar.
- Presentear.
- Treinar.
- Recrutar.
- Romantizar, se essa rota fizer sentido para o tom do jogo.
- Trair ou ser traido.

## Modulo: Missoes e eventos

Responsabilidade:

- Criar objetivos rastreaveis.
- Controlar progresso.
- Aplicar recompensas e consequencias.
- Permitir falha de missoes.

Tipos de missao:

- Principal.
- Secundaria.
- Faccao.
- Relacionamento.
- Masmorra.
- Caca.
- Comercio.
- Investigacao.
- Sobrevivencia.

Uma missao boa nao precisa ter apenas sucesso. Ela pode ter:

- Sucesso perfeito.
- Sucesso com custo.
- Falha recuperavel.
- Falha permanente.
- Resolucao alternativa por combate, furtividade, diplomacia ou item especial.

Missoes tambem podem depender de tempo:

- Missao disponivel apenas de noite.
- Entrega com prazo ate o amanhecer.
- Resgate que fica mais dificil depois de algumas horas.
- NPC que so entrega recompensa em determinado local e horario.
- Evento de festival, invasao ou ritual em dia especifico.

## Modulo: Inventario, itens e equipamentos

Responsabilidade:

- Guardar itens.
- Usar consumiveis.
- Equipar armas e armaduras.
- Aplicar efeitos passivos.
- Controlar peso, raridade e valor.

Tipos de item:

- Consumivel.
- Arma.
- Armadura.
- Acessorio.
- Material.
- Artefato.
- Item de quest.
- Livro ou pergaminho.

Exemplo:

```ts
type ItemDefinition = {
  id: string;
  name: string;
  type: "consumable" | "weapon" | "armor" | "accessory" | "material" | "quest";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effects: Effect[];
  value: number;
};
```

## Modulo: Economia e lojas

Responsabilidade:

- Definir precos.
- Aplicar descontos por reputacao.
- Controlar estoque.
- Permitir compra, venda, troca e encomendas.

A economia pode reagir ao mundo:

- Cidade em guerra aumenta preco de comida e armas.
- Jogador salvou comerciantes, entao recebe desconto.
- Jogador roubou ou enganou vendedores, entao perde acesso a lojas.

## Modulo: Achievements, titulos e reputacao

Responsabilidade:

- Detectar feitos do jogador.
- Liberar conquistas.
- Aplicar titulos.
- Registrar marcos da campanha.

Achievements podem ser puramente visuais ou ter efeito mecanico leve.

Exemplos:

- Primeira Morte: morreu pela primeira vez.
- Predador de Slimes: derrotou 50 slimes.
- Diplomata Improvavel: resolveu 10 conflitos sem combate.
- Herdeiro do Caos: usou magia proibida 5 vezes.
- Comerciante Esperto: acumulou 10.000 moedas sem roubar.
- Inimigo Publico: atingiu reputacao muito negativa em uma cidade.

Titulos podem alterar dialogos e reputacao:

- "Heroi da Vila" abre portas.
- "Bruxo Profano" causa medo e hostilidade.
- "Mestre das Masmorras" aumenta respeito entre aventureiros.

## Modulo: Persistencia com MongoDB Atlas

Responsabilidade:

- Salvar usuarios.
- Salvar campanhas.
- Salvar personagens.
- Salvar estado do mundo.
- Salvar logs importantes.
- Carregar saves.

Variavel esperada no `.env`:

```env
MONGODB_URI=sua_uri_do_mongodb_atlas
```

Colecoes sugeridas:

```txt
users
campaigns
saves
characters
content_items
content_enemies
content_scenes
content_npcs
training_sessions
achievements
```

Para a primeira versao, da para comecar com poucas colecoes:

- `saves`: estado completo da partida.
- `training_sessions`: treinos em andamento, quando a sessao nao ficar embutida no save.
- `users`: dados do jogador, quando houver login.
- `content`: conteudo versionado do jogo, se o conteudo for salvo no banco.

Uma abordagem simples:

```ts
type SaveDocument = {
  _id: string;
  userId?: string;
  name: string;
  gameVersion: string;
  gameState: GameState;
  activeTrainingSessions: TrainingSession[];
  createdAt: Date;
  updatedAt: Date;
};
```

Para timers reais, o backend deve comparar `finishesAt` com o horario atual do servidor. Isso evita depender do navegador aberto e permite que treinos terminem mesmo com o jogador offline.

## Modulo: Conteudo em dados

Responsabilidade:

- Manter o conteudo fora da logica principal.
- Facilitar criacao de cenas, itens, inimigos e NPCs.
- Permitir validacao antes de rodar o jogo.

No inicio, o conteudo pode ficar em arquivos TypeScript ou JSON dentro de `src/content`.

Depois, pode migrar para MongoDB ou para um painel de administracao.

Exemplo de cena:

```ts
export const tavernStart = {
  id: "tavern_start",
  text: "Você desperta em uma taverna desconhecida. A chuva bate contra as janelas.",
  choices: [
    {
      id: "talk_old_man",
      label: "Falar com o velho encapuzado",
      nextSceneId: "old_man_intro"
    },
    {
      id: "leave_tavern",
      label: "Sair para a rua",
      nextSceneId: "first_city_square"
    }
  ]
};
```

## Interface do jogo

Primeira versao recomendada:

- Tela principal com narrativa no centro.
- Painel lateral com status do personagem.
- Area de escolhas abaixo do texto.
- Abas para inventario, missoes, mapa, relacoes e conquistas.
- Log de eventos recentes.
- Relogio do mundo visivel: dia, horario e periodo.
- Indicadores de stamina, fadiga e sono.
- Menu de treino no painel do personagem.

Fluxo visual:

```txt
Topo: nome do personagem, nivel, vida, mana, stamina, ouro, dia e horario
Centro: texto narrativo e resultado das acoes
Baixo: escolhas disponiveis
Lateral: inventario, missoes, NPCs, treino, conquistas
```

O jogo pode comecar como uma experiencia textual rica. Depois entram mapas, retratos, animacoes leves e telas de combate mais visuais.

## Plano de execucao

### Fase 1 - Fundacao

Objetivo: ter um prototipo jogavel em texto.

Entregas:

- Criar projeto Next.js com TypeScript.
- Configurar MongoDB Atlas via `MONGODB_URI`.
- Criar tipos principais: jogador, estado do jogo, cena, escolha, item, inimigo.
- Criar relogio interno simples com dia, hora e periodo.
- Criar motor de cenas.
- Criar tela inicial jogavel.
- Criar salvamento simples.

Resultado esperado:

- O jogador cria um personagem simples.
- O jogador passa por cenas iniciais.
- O horario avanca conforme as escolhas.
- O jogo salva e carrega o progresso.

### Fase 2 - Combate e inventario

Objetivo: adicionar risco e recompensa.

Entregas:

- Sistema de combate por turnos.
- Inimigos basicos.
- Acoes de combate: atacar, defender, usar item, fugir.
- Inventario.
- Itens consumiveis.
- Custo de stamina para acoes fisicas.
- Recompensas de XP e moedas.

Resultado esperado:

- O jogador entra em combate.
- Pode vencer, fugir ou morrer.
- Recebe recompensas.
- Usa itens para sobreviver.

### Fase 3 - Progressao

Objetivo: fazer o personagem evoluir de forma interessante.

Entregas:

- Sistema de XP e nivel.
- Atributos.
- Habilidades.
- Sistema inicial de treino por tempo real e tempo do mundo.
- Sono, fadiga e recuperacao de stamina.
- Titulos.
- Primeiras classes ou caminhos.
- Conquistas basicas.

Resultado esperado:

- O jogador sente crescimento real.
- Escolhas de evolucao mudam a forma de jogar.
- O jogador pode iniciar um treino, esperar o timer e resgatar os ganhos.

### Fase 4 - NPCs e reputacao

Objetivo: dar vida ao mundo.

Entregas:

- NPCs com dialogos condicionais.
- NPCs com agenda por horario.
- Afinidade e confianca.
- Reputacao por cidade ou faccao.
- Missoes dadas por NPCs.
- Consequencias sociais.

Resultado esperado:

- NPCs lembram acoes importantes.
- NPCs aparecem e somem conforme rotina.
- O jogador pode ganhar aliados, inimigos e oportunidades.

### Fase 5 - Mundo aberto controlado

Objetivo: aumentar liberdade sem perder controle tecnico.

Entregas:

- Mapa de locais conectados.
- Viagem entre areas.
- Eventos aleatorios.
- Perigo variavel por horario.
- Masmorras simples.
- Faccoes.
- Missoes paralelas.

Resultado esperado:

- O jogador escolhe onde ir e o que priorizar.
- O mundo reage gradualmente.

### Fase 6 - Conteudo, polimento e replay

Objetivo: aumentar profundidade e rejogabilidade.

Entregas:

- Mais origens de reencarnacao.
- Mais classes.
- Mais NPCs e rotas.
- Eventos raros.
- Achievements avancados.
- Balanceamento.
- Melhorias visuais.

Resultado esperado:

- O jogo passa a ter campanhas diferentes entre si.
- As decisoes geram historias emergentes.

## Prioridades tecnicas

1. Criar a logica do jogo como funcoes puras sempre que possivel.
2. Usar TypeScript para evitar erros em dados de conteudo.
3. Validar dados com Zod antes de usar no jogo.
4. Separar conteudo de regras.
5. Salvar estado completo da partida no MongoDB.
6. Salvar timers reais com timestamps do servidor, nao apenas no estado do frontend.
7. Criar testes para combate, tempo, treino, progressao, inventario e conquistas.
8. Manter o prototipo simples antes de adicionar sistemas complexos.

## Primeira fatia jogavel

A primeira versao pode seguir este roteiro:

1. O jogador morre no mundo original.
2. Escolhe ou recebe uma origem de reencarnacao.
3. Acorda em uma vila de fantasia.
4. Conversa com um NPC.
5. Recebe uma missao simples.
6. Entra em combate contra um inimigo fraco.
7. Ganha XP, item e uma pequena mudanca de reputacao.
8. Faz um treino basico de forca que consome stamina e avanca o horario.
9. Dorme para recuperar stamina e reduzir fadiga.
10. Salva o jogo.

Essa fatia ja prova os principais sistemas:

- Narrativa.
- Escolhas.
- NPC.
- Combate.
- Inventario.
- Progressao.
- Tempo.
- Treino.
- Stamina e sono.
- Reputacao.
- Persistencia.

## Descricoes de imagens para gerar com AI

Nao e necessario gerar imagens para iniciar o desenvolvimento, mas estes assets ajudariam nas primeiras telas:

### Tela inicial

Um jovem de costas diante de um portal de luz azul e dourada, com fragmentos de uma cidade moderna desaparecendo atras dele e um mundo de fantasia surgindo a frente, contendo castelo distante, floresta, montanhas e ilhas flutuantes. Estilo anime cinematico, alta qualidade, iluminacao dramatica, sem texto.

### Vila inicial

Uma vila medieval de fantasia em dia chuvoso, ruas de pedra, lanternas quentes, uma taverna acolhedora, pessoas usando capas, montanhas ao fundo, atmosfera de inicio de aventura, estilo anime detalhado, sem texto.

### Taverna

Interior de taverna medieval aconchegante, mesas de madeira, lareira acesa, aventureiros conversando, um velho encapuzado sentado no canto observando o protagonista, luz quente, estilo anime, sem texto.

### Combate inicial

Um aventureiro iniciante enfrentando um lobo sombrio em uma floresta escura, postura defensiva, efeitos leves de magia, tensao de combate por turnos, estilo anime action fantasy, sem texto.

### NPC guia

Retrato de um velho encapuzado com olhar misterioso, barba curta, amuleto magico no peito, expressao ambigua entre mentor e manipulador, fundo de taverna desfocado, estilo anime semi-realista, sem texto.

### Mapa do mundo

Mapa ilustrado de um continente de fantasia com reinos, florestas, desertos, montanhas, portos, ruinas antigas e uma zona corrompida ao norte, estilo mapa de RPG desenhado a mao, sem nomes e sem texto.

## Riscos e decisoes importantes

- **Escopo grande demais:** RPGs crescem rapido. Comecar com uma fatia jogavel pequena.
- **Combate sem profundidade:** adicionar status, intencoes de inimigos e habilidades com sinergia.
- **Liberdade falsa:** permitir rotas alternativas reais, nao apenas botoes diferentes com o mesmo resultado.
- **Conteudo dificil de manter:** estruturar cenas, itens e NPCs como dados validados.
- **Banco acoplado ao jogo:** manter a logica independente do MongoDB; o banco apenas salva e carrega.
- **Timers exploraveis:** validar treinos no servidor usando timestamps salvos, nunca confiar apenas no cliente.
- **Tempo punitivo demais:** usar stamina e sono como decisao estrategica, sem transformar toda acao em espera cansativa.

## Definicao de sucesso do MVP

O MVP esta pronto quando:

- O jogador consegue criar um personagem.
- Existe uma introducao de reencarnacao.
- Existem pelo menos 5 cenas com escolhas.
- Existe pelo menos 1 NPC com dialogo condicional.
- Existe pelo menos 1 combate completo.
- Existe inventario com pelo menos 1 item usavel.
- Existe XP e subida de nivel.
- Existe relogio interno que afeta pelo menos 1 evento, 1 NPC ou 1 area.
- Existe treino com timer real, avanco de tempo no mundo, custo de stamina e fadiga.
- Existe sono ou descanso para recuperar stamina.
- Existe pelo menos 1 conquista.
- O jogo salva e carrega usando MongoDB Atlas.

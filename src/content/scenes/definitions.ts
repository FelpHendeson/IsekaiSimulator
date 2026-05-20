import type { SceneDefinition } from "../../game/types";

export const sceneDefinitions: SceneDefinition[] = [
  {
    id: "reincarnation_intro",
    title: "Entre mundos",
    text: "A ultima memoria do mundo antigo vem em fragmentos: chuva, farois e uma freada tarde demais. Quando voce abre os olhos, esta sentado diante de uma mesa de madeira em uma taverna quente demais para ser sonho.",
    choices: [
      {
        id: "inspect_status",
        label: "Tentar abrir a tela de status",
        nextSceneId: "status_awakened",
        timeCostMinutes: 5,
        effects: [
          { type: "setFlag", key: "saw_status_screen", value: true },
          { type: "addLog", message: "Uma interface translucida responde ao seu pensamento." },
        ],
      },
      {
        id: "look_around_tavern",
        label: "Observar a taverna",
        nextSceneId: "tavern_room",
        timeCostMinutes: 10,
      },
    ],
  },
  {
    id: "status_awakened",
    title: "Sistema desperto",
    text: "Letras claras surgem no ar: nivel, atributos, vida, mana e stamina. Nao ha tutorial, apenas a sensacao incomoda de que este mundo mede tudo que voce faz.",
    choices: [
      {
        id: "hide_status",
        label: "Fechar a tela antes que alguem veja",
        nextSceneId: "tavern_room",
        timeCostMinutes: 5,
        effects: [{ type: "setFlag", key: "hid_status_screen", value: true }],
      },
      {
        id: "study_status",
        label: "Estudar os atributos com calma",
        nextSceneId: "tavern_room",
        timeCostMinutes: 20,
        effects: [
          { type: "setFlag", key: "understands_basic_status", value: true },
          { type: "addLog", message: "Voce entende o basico: treino e escolhas moldam seus atributos." },
        ],
      },
    ],
  },
  {
    id: "tavern_room",
    title: "A taverna de Elaria",
    text: "A taverna esta cheia de aventureiros molhados pela chuva. Um velho encapuzado observa voce do canto, como se ja esperasse por esse despertar.",
    choices: [
      {
        id: "talk_mentor",
        label: "Falar com o velho encapuzado",
        nextSceneId: "old_man_intro",
        timeCostMinutes: 15,
      },
      {
        id: "leave_tavern_square",
        label: "Sair para a praca da vila",
        nextSceneId: "village_square",
        timeCostMinutes: 10,
        effects: [{ type: "setLocation", locationId: "first_village" }],
      },
    ],
  },
  {
    id: "old_man_intro",
    title: "O velho encapuzado",
    text: "O velho chama voce de reencarnado antes que voce diga qualquer coisa. Ele oferece uma moeda, um conselho e uma missao simples: registrar-se na guilda antes do anoitecer.",
    choices: [
      {
        id: "accept_old_man_help",
        label: "Aceitar a ajuda",
        nextSceneId: "village_square",
        timeCostMinutes: 20,
        effects: [
          { type: "addGold", amount: 10 },
          { type: "startQuest", questId: "guild_registration" },
          { type: "setFlag", key: "accepted_mentor_help", value: true },
        ],
      },
      {
        id: "refuse_old_man_help",
        label: "Recusar e sair",
        nextSceneId: "village_square",
        timeCostMinutes: 5,
        effects: [{ type: "setFlag", key: "refused_mentor_help", value: true }],
      },
    ],
  },
  {
    id: "village_square",
    title: "Praca da vila",
    text: "A praca de Elaria mistura barracas, guardas sonolentos e aventureiros procurando trabalho. Ao norte fica a guilda; ao leste, a estrada leva para o Bosque Sombrio.",
    choices: [
      {
        id: "read_guild_notice",
        label: "Ler o quadro da guilda",
        nextSceneId: "guild_notice",
        timeCostMinutes: 15,
      },
      {
        id: "go_forest_edge",
        label: "Ir ate a entrada do Bosque Sombrio",
        nextSceneId: "forest_edge",
        timeCostMinutes: 45,
        effects: [{ type: "setLocation", locationId: "shadow_woods" }],
      },
    ],
  },
  {
    id: "guild_notice",
    title: "Quadro da guilda",
    text: "O quadro lista trabalhos simples: coletar ervas, escoltar mercadores e investigar lobos estranhos no bosque. O aviso de lobos foi marcado como perigoso depois do anoitecer.",
    choices: [
      {
        id: "take_wolf_notice",
        label: "Pegar o aviso dos lobos",
        nextSceneId: "village_square",
        timeCostMinutes: 10,
        effects: [
          { type: "startQuest", questId: "shadow_wolf_notice" },
          { type: "addLog", message: "Missao adicionada: investigar lobos no Bosque Sombrio." },
        ],
      },
      {
        id: "return_square_from_guild",
        label: "Voltar para a praca",
        nextSceneId: "village_square",
        timeCostMinutes: 5,
      },
    ],
  },
  {
    id: "forest_edge",
    title: "Entrada do Bosque Sombrio",
    text: "As arvores bloqueiam parte da luz. Mesmo de dia, o ar parece mais frio. A estrada ainda permite voltar, mas cada minuto aqui aproxima a vila do anoitecer.",
    choices: [
      {
        id: "return_to_village",
        label: "Voltar para Elaria",
        nextSceneId: "village_square",
        timeCostMinutes: 45,
        effects: [{ type: "setLocation", locationId: "first_village" }],
      },
      {
        id: "mark_forest_threat",
        label: "Marcar rastros estranhos e recuar",
        nextSceneId: "village_square",
        timeCostMinutes: 30,
        effects: [
          { type: "setFlag", key: "found_shadow_tracks", value: true },
          { type: "setLocation", locationId: "first_village" },
          { type: "addLog", message: "Voce encontrou rastros escuros demais para serem de lobos comuns." },
        ],
      },
    ],
  },
];


import type { QuestDefinition } from "../../game/types";

export const questDefinitions: QuestDefinition[] = [
  {
    id: "guild_registration",
    title: "Registro na Guilda",
    description: "Fale com Mira na Guilda de Elaria e registre sua identidade neste mundo.",
    startLocationId: "guild_hall",
    recommendedLevel: 1,
    rewardGold: 5,
    rewardXp: 15,
  },
  {
    id: "shadow_wolf_notice",
    title: "Rastros no Bosque",
    description: "Investigue os rastros escuros perto do Bosque Sombrio antes que anoiteca.",
    startLocationId: "first_village",
    recommendedLevel: 1,
    rewardGold: 12,
    rewardXp: 35,
  },
  {
    id: "first_training",
    title: "Corpo de outro mundo",
    description: "Complete qualquer treino para entender como seu corpo evolui com tempo e stamina.",
    startLocationId: "first_village",
    recommendedLevel: 1,
    rewardGold: 3,
    rewardXp: 10,
  },
  {
    id: "night_rumor",
    title: "Rumores da Madrugada",
    description: "Encontre o informante Corvo a noite para descobrir por que os lobos evitam a estrada principal.",
    startLocationId: "first_village",
    recommendedLevel: 1,
    rewardGold: 10,
    rewardXp: 20,
  },
];


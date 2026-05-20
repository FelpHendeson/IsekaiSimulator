import type { NpcDefinition } from "../../game/types";

export const npcDefinitions: NpcDefinition[] = [
  {
    id: "hooded_mentor",
    name: "Velho Encapuzado",
    role: "Mentor suspeito",
    faction: "desconhecida",
    personality: "Paciente, criptico e calculista.",
    schedule: [
      {
        period: "morning",
        locationId: "first_village",
        availableInteractions: ["talk", "quest_hint"],
      },
      {
        period: "afternoon",
        locationId: "first_village",
        availableInteractions: ["talk", "quest_hint"],
      },
      {
        period: "evening",
        locationId: "first_village",
        availableInteractions: ["talk"],
      },
      {
        period: "night",
        locationId: "first_village",
        availableInteractions: ["secret_warning"],
      },
    ],
  },
  {
    id: "village_blacksmith",
    name: "Brunna",
    role: "Ferreira da vila",
    faction: "artesaos",
    personality: "Direta, pratica e desconfiada de aventureiros novos.",
    schedule: [
      {
        period: "morning",
        locationId: "first_village",
        availableInteractions: ["shop", "repair", "strength_training"],
      },
      {
        period: "afternoon",
        locationId: "first_village",
        availableInteractions: ["shop", "repair", "strength_training"],
      },
      {
        period: "evening",
        locationId: "first_village",
        availableInteractions: ["talk"],
      },
    ],
  },
  {
    id: "guild_clerk",
    name: "Mira",
    role: "Atendente da guilda",
    faction: "guilda dos aventureiros",
    personality: "Organizada, impaciente e muito atenta a prazos.",
    schedule: [
      {
        period: "morning",
        locationId: "guild_hall",
        availableInteractions: ["register", "quests"],
      },
      {
        period: "afternoon",
        locationId: "guild_hall",
        availableInteractions: ["register", "quests", "reward"],
      },
    ],
  },
  {
    id: "night_informant",
    name: "Corvo",
    role: "Informante noturno",
    faction: "submundo",
    personality: "Sarcástico, oportunista e bem informado.",
    schedule: [
      {
        period: "night",
        locationId: "first_village",
        availableInteractions: ["rumors", "black_market"],
      },
      {
        period: "late_night",
        locationId: "first_village",
        availableInteractions: ["rumors", "black_market", "forbidden_info"],
      },
    ],
  },
];

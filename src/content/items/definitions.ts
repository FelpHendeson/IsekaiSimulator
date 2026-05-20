import type { ItemDefinition } from "../../game/types";

export const itemDefinitions: ItemDefinition[] = [
  {
    id: "small_potion",
    name: "Pocao de Cura",
    type: "consumable",
    description: "Restaura 50 pontos de vida.",
    value: 20,
    rarity: "common",
    effects: {
      heal: 50,
    },
  },
  {
    id: "mana_potion",
    name: "Pocao de Mana",
    type: "consumable",
    description: "Restaura 30 pontos de mana.",
    value: 25,
    rarity: "common",
    effects: {
      mana: 30,
    },
  },
  {
    id: "iron_sword",
    name: "Espada de Ferro",
    type: "weapon",
    description: "Uma espada basica de ferro.",
    value: 100,
    rarity: "common",
    equipSlot: "weapon",
    effects: {
      attack: 5,
    },
  },
  {
    id: "steel_sword",
    name: "Espada de Aco",
    type: "weapon",
    description: "Uma espada resistente de aco.",
    value: 250,
    rarity: "uncommon",
    equipSlot: "weapon",
    effects: {
      attack: 8,
    },
  },
  {
    id: "leather_armor",
    name: "Armadura de Couro",
    type: "armor",
    description: "Armadura basica de couro.",
    value: 80,
    rarity: "common",
    equipSlot: "armor",
    effects: {
      defense: 3,
    },
  },
  {
    id: "common_herb",
    name: "Erva Comum",
    type: "material",
    description: "Erva medicinal comum.",
    value: 5,
    rarity: "common",
    effects: {},
  },
  {
    id: "rare_herb",
    name: "Erva Rara",
    type: "material",
    description: "Erva medicinal rara.",
    value: 15,
    rarity: "uncommon",
    effects: {},
  },
];


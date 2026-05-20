export type TimePeriod =
  | "dawn"
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "late_night";

export type GameClockState = {
  day: number;
  hour: number;
  minute: number;
  period: TimePeriod;
};

export type PlayerStatKey =
  | "strength"
  | "agility"
  | "vitality"
  | "intelligence"
  | "wisdom"
  | "charisma"
  | "luck";

export type PlayerStats = Record<PlayerStatKey, number>;

export type EnergyState = {
  stamina: number;
  maxStamina: number;
  fatigue: number;
  sleepDebt: number;
};

export type PlayerState = {
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  stats: PlayerStats;
  energy: EnergyState;
};

export type TimeWindow = {
  fromHour: number;
  toHour: number;
};

export type LocationDefinition = {
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

export type WorldState = {
  locations: Record<string, LocationDefinition>;
};

export type InventoryState = {
  itemIds: string[];
};

export type QuestState = {
  id: string;
  status: "available" | "active" | "completed" | "failed";
  deadline?: GameClockState;
};

export type SceneRequirement =
  | {
      type: "flagEquals";
      key: string;
      value: boolean | string | number;
    }
  | {
      type: "hasItem";
      itemId: string;
    };

export type SceneEffect =
  | {
      type: "setFlag";
      key: string;
      value: boolean | string | number;
    }
  | {
      type: "addGold";
      amount: number;
    }
  | {
      type: "addItem";
      itemId: string;
    }
  | {
      type: "startQuest";
      questId: string;
    }
  | {
      type: "setLocation";
      locationId: string;
    }
  | {
      type: "addLog";
      message: string;
    };

export type SceneChoice = {
  id: string;
  label: string;
  nextSceneId?: string;
  timeCostMinutes?: number;
  requirements?: SceneRequirement[];
  effects?: SceneEffect[];
};

export type SceneDefinition = {
  id: string;
  title: string;
  text: string;
  choices: SceneChoice[];
};

export type NpcScheduleRule = {
  period: TimePeriod;
  locationId: string;
  availableInteractions: string[];
};

export type NpcDefinition = {
  id: string;
  name: string;
  role: string;
  faction?: string;
  personality: string;
  schedule: NpcScheduleRule[];
};

export type TrainingReward =
  | {
      type: "stat";
      stat: PlayerStatKey;
      amount: number;
    }
  | {
      type: "maxStamina";
      amount: number;
    }
  | {
      type: "maxHp";
      amount: number;
    };

export type TrainingDefinition = {
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

export type TrainingSession = {
  id: string;
  trainingId: string;
  startedAtIso: string;
  finishesAtIso: string;
  worldTimeAdvanceMinutes: number;
  staminaCost: number;
};

export type GameLogEntry = {
  id: string;
  createdAtIso: string;
  message: string;
};

export type GameState = {
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
  activeTrainingSessions: TrainingSession[];
  eventLog: GameLogEntry[];
};

export type GameAction =
  | { type: "CHOOSE_SCENE_OPTION"; optionId: string }
  | { type: "START_TRAINING"; trainingId: string }
  | { type: "CLAIM_TRAINING"; trainingSessionId: string }
  | { type: "SLEEP"; hours: number };

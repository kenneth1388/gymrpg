export const colors = {
  bg:           '#0F0F14',
  bgCard:       '#17171F',
  bgElevated:   '#1E1E2A',
  border:       '#2A2A3A',

  primary:      '#7C6FF7',
  primaryDim:   '#3D3878',
  primaryGlow:  '#A99DF9',

  gold:         '#F5C842',
  green:        '#3DD68C',
  amber:        '#F5A623',
  red:          '#E85D4A',
  blue:         '#4A9EF5',
  teal:         '#2DD4BF',

  textPrimary:   '#F0EFF8',
  textSecondary: '#8884A8',
  textDim:       '#4A4860',

  easy:             '#3DD68C',
  ish:              '#8884A8',
  hard:             '#F5A623',
  'very difficult': '#E85D4A',
};

export const EXERCISES = [
  { id: 'pullups',  name: 'Pull-ups',              muscles: 'Back · Biceps · Core',         group: 'pull',  sets: 3, repMin: 3,  repMax: 6,  target: 5,  note: 'Stop 1 rep before failure' },
  { id: 'pushups',  name: 'Push-ups',              muscles: 'Chest · Triceps · Core',        group: 'push',  sets: 3, repMin: 8,  repMax: 12, target: 10, note: '' },
  { id: 'chinups',  name: 'Chin-ups',              muscles: 'Biceps · Back',                 group: 'pull',  sets: 3, repMin: 3,  repMax: 6,  target: 4,  note: 'Biceps rested from pull-ups' },
  { id: 'dips',     name: 'Dips',                  muscles: 'Triceps · Chest · Shoulders',   group: 'push',  sets: 3, repMin: 6,  repMax: 10, target: 8,  note: 'Pause at bottom' },
  { id: 'ohp',      name: 'OHP',                   muscles: 'Shoulders · Traps',             group: 'push',  sets: 3, repMin: 6,  repMax: 10, target: 8,  note: '' },
  { id: 'deadlift', name: 'Deadlift',              muscles: 'Hamstrings · Glutes · Low Back',group: 'lower', sets: 3, repMin: 5,  repMax: 8,  target: 6,  note: '15kg each side' },
  { id: 'bss',      name: 'Bulgarian Split Squat', muscles: 'Quads · Glutes · Hamstrings',   group: 'lower', sets: 3, repMin: 8,  repMax: 10, target: 8,  note: '3s down · pause · 1s up · each leg' },
  { id: 'curls',    name: 'Curls',                 muscles: 'Biceps · Forearms',             group: 'pull',  sets: 3, repMin: 8,  repMax: 12, target: 10, note: 'Full ROM' },
  { id: 'legraises',name: 'Leg Raises',            muscles: 'Core · Hip Flexors',            group: 'core',  sets: 3, repMin: 10, repMax: 15, target: 10, note: '' },
  { id: 'planks',   name: 'Planks',                muscles: 'Core Stability',                group: 'core',  sets: 3, repMin: 40, repMax: 60, target: 40, unit: 'sec', note: 'Increase duration over time' },
];

export const MUSCLE_GROUPS = [
  { key: 'back',      label: 'Back',      exercises: ['pullups', 'chinups', 'deadlift'] },
  { key: 'chest',     label: 'Chest',     exercises: ['pushups', 'dips'] },
  { key: 'shoulders', label: 'Shoulders', exercises: ['ohp', 'dips'] },
  { key: 'biceps',    label: 'Biceps',    exercises: ['chinups', 'curls', 'pullups'] },
  { key: 'triceps',   label: 'Triceps',   exercises: ['dips', 'pushups'] },
  { key: 'core',      label: 'Core',      exercises: ['legraises', 'planks', 'pushups'] },
  { key: 'legs',      label: 'Legs',      exercises: ['bss', 'deadlift'] },
];

export const DIFFICULTIES = ['easy', 'ish', 'hard', 'very difficult'];
export const DIFF_LABEL   = { easy: 'Easy', ish: 'Ish', hard: 'Hard', 'very difficult': 'V.Hard' };
export const DIFF_MULT    = { easy: 1.0, ish: 1.25, hard: 1.5, 'very difficult': 2.0 };
export const DIFF_WEIGHT  = { easy: 0.5, ish: 0.75, hard: 1.0, 'very difficult': 1.5 };

export const DECAY_INTERVAL_DAYS = 3;
export const DECAY_BASE_XP       = 200;
export const XP_SESSION_BASE     = 50;

export const LEVELS = [
  { level: 1,  name: 'Novice',   xp: 0     },
  { level: 2,  name: 'Trainee',  xp: 300   },
  { level: 3,  name: 'Fighter',  xp: 700   },
  { level: 4,  name: 'Warrior',  xp: 1300  },
  { level: 5,  name: 'Veteran',  xp: 2200  },
  { level: 6,  name: 'Champion', xp: 3500  },
  { level: 7,  name: 'Elite',    xp: 5500  },
  { level: 8,  name: 'Master',   xp: 8000  },
  { level: 9,  name: 'Legend',   xp: 12000 },
  { level: 10, name: 'Apex',     xp: 18000 },
];

export const BADGES = [
  { id: 'first_session',   name: 'First Blood',     desc: 'Log your first session',          icon: '⚔️'  },
  { id: 'sessions_5',      name: 'Five Sessions',   desc: 'Complete 5 sessions',             icon: '🔥'  },
  { id: 'sessions_10',     name: 'Ten Strong',      desc: 'Complete 10 sessions',            icon: '💪'  },
  { id: 'sessions_25',     name: 'Grinder',         desc: 'Complete 25 sessions',            icon: '🏋️' },
  { id: 'streak_3',        name: 'Hat Trick',       desc: '3 sessions in one week',          icon: '⚡'  },
  { id: 'first_pr',        name: 'New Heights',     desc: 'Set your first Personal Record',  icon: '🏆'  },
  { id: 'pr_5',            name: 'Record Breaker',  desc: 'Set 5 Personal Records',          icon: '🥇'  },
  { id: 'pullup_6',        name: 'Bar King',        desc: 'Hit 6 pull-ups in a set',         icon: '🦍'  },
  { id: 'chinup_6',        name: 'Chin Up!',        desc: 'Hit 6 chin-ups in a set',         icon: '💎'  },
  { id: 'dips_10',         name: 'Dip Lord',        desc: 'Hit 10 dips in a set',            icon: '🔱'  },
  { id: 'perfect_session', name: 'No Quit',         desc: 'Complete all sets in a session',  icon: '🛡️' },
  { id: 'survived_decay',  name: 'Came Back',       desc: 'Log a session after XP decay',    icon: '💀'  },
  { id: 'bss_unlocked',    name: 'One Leg',         desc: 'Complete Bulgarian Split Squats', icon: '🦵'  },
];

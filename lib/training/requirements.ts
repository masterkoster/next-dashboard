// Training Requirements - FAA 14 CFR Part 61
// Simplified for initial implementation

export type GoalType = 'PPL' | 'IR' | 'CPL' | 'CFI' | 'CFII' | 'MEI' | 'ATP' | 'HELICOPTER';

export interface Requirement {
  key: string;
  label: string;
  description: string;
  required: number;
  unit: 'hours' | 'landings' | 'approaches';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  requirements: string[];
}

export interface TrainingGoalData {
  id: GoalType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  totalHoursRequired: number;
  requirements: Requirement[];
  milestones: Milestone[];
  prerequisites?: GoalType[];
  category: 'airplane' | 'helicopter';
}

// PPL - Private Pilot (40 hours)
export const PPL_GOAL: TrainingGoalData = {
  id: 'PPL',
  name: 'Private Pilot',
  shortName: 'PPL',
  description: 'Fly for pleasure or personal travel',
  icon: '🛩️',
  totalHoursRequired: 40,
  category: 'airplane',
  prerequisites: [],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 40, unit: 'hours' },
    { key: 'soloTime', label: 'Solo Flight Time', description: 'Minimum solo flight time', required: 10, unit: 'hours' },
    { key: 'dualGiven', label: 'Dual Instruction', description: 'Flight training from instructor', required: 20, unit: 'hours' },
    { key: 'crossCountry', label: 'Cross Country', description: 'Minimum cross country time', required: 10, unit: 'hours' },
    { key: 'night', label: 'Night Flight', description: 'Minimum night flight time', required: 3, unit: 'hours' },
    { key: 'instrument', label: 'Instrument Time', description: 'Hood or instrument ground time', required: 3, unit: 'hours' },
    { key: 'dayLandings', label: 'Day Takeoffs/Landings', description: 'Day solo takeoffs and landings', required: 3, unit: 'landings' },
    { key: 'nightLandings', label: 'Night Takeoffs/Landings', description: 'Night solo takeoffs and landings', required: 3, unit: 'landings' },
  ],
  milestones: [
    { id: 'first-flight', title: 'First Flight', description: 'Your first lesson', order: 1, requirements: ['dualGiven'] },
    { id: 'first-solo', title: 'First Solo', description: 'Flying without the instructor', order: 2, requirements: ['soloTime', 'dayLandings'] },
    { id: 'first-xc', title: 'First Cross Country', description: 'First flight to another airport', order: 3, requirements: ['crossCountry'] },
    { id: 'night-flying', title: 'Night Flying', description: 'First night flight', order: 4, requirements: ['night', 'nightLandings'] },
    { id: 'instrument', title: 'Instrument Basics', description: 'Introduction to instrument flight', order: 5, requirements: ['instrument'] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 6, requirements: ['totalTime', 'soloTime', 'crossCountry', 'night', 'instrument', 'dayLandings', 'nightLandings'] },
  ],
};

// IR - Instrument Rating (50 hours)
export const IR_GOAL: TrainingGoalData = {
  id: 'IR',
  name: 'Instrument Rating',
  shortName: 'IR',
  description: 'Fly in instrument meteorological conditions',
  icon: '📊',
  totalHoursRequired: 50,
  category: 'airplane',
  prerequisites: ['PPL'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 50, unit: 'hours' },
    { key: 'instrumentTime', label: 'Instrument Time', description: 'Actual instrument time', required: 40, unit: 'hours' },
    { key: 'dualInstrument', label: 'Dual Instrument', description: 'Instrument instruction', required: 15, unit: 'hours' },
    { key: 'xcDual', label: 'XC Dual Instrument', description: 'Cross country instrument time', required: 15, unit: 'hours' },
    { key: 'approaches', label: 'Instrument Approaches', description: 'Completed approaches', required: 6, unit: 'approaches' },
  ],
  milestones: [
    { id: 'basic-instrument', title: 'Basic Instrument', description: 'Introduction to attitude flying', order: 1, requirements: ['dualInstrument'] },
    { id: 'approaches', title: 'Approaches', description: 'All types of approaches', order: 2, requirements: ['approaches'] },
    { id: 'xc-instrument', title: 'XC Instrument', description: 'Cross country in IMC', order: 3, requirements: ['xcDual'] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 4, requirements: ['instrumentTime', 'dualInstrument', 'xcDual', 'approaches'] },
  ],
};

// CPL - Commercial Pilot (250 hours)
export const CPL_GOAL: TrainingGoalData = {
  id: 'CPL',
  name: 'Commercial Pilot',
  shortName: 'CPL',
  description: 'Fly for compensation or hire',
  icon: '💼',
  totalHoursRequired: 250,
  category: 'airplane',
  prerequisites: ['IR'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 250, unit: 'hours' },
    { key: 'picTime', label: 'PIC Time', description: 'Pilot in command time', required: 100, unit: 'hours' },
    { key: 'crossCountry', label: 'Cross Country', description: 'Cross country time', required: 100, unit: 'hours' },
    { key: 'night', label: 'Night Flight', description: 'Night flight time', required: 20, unit: 'hours' },
    { key: 'instrumentTime', label: 'Instrument Time', description: 'Actual instrument time', required: 20, unit: 'hours' },
    { key: 'dualGiven', label: 'Dual Given', description: 'Flight instruction given', required: 20, unit: 'hours' },
  ],
  milestones: [
    { id: 'building-hours', title: 'Building Hours', description: 'Accumulate required flight time', order: 1, requirements: ['picTime'] },
    { id: 'commercial-maneuvers', title: 'Commercial Maneuvers', description: 'Precision maneuvers training', order: 2, requirements: ['dualGiven'] },
    { id: 'xc-long', title: 'Long Cross Countries', description: 'Long XC flights as PIC', order: 3, requirements: ['crossCountry'] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 4, requirements: ['totalTime', 'picTime', 'crossCountry', 'night', 'instrumentTime', 'dualGiven'] },
  ],
};

// CFI - Certified Flight Instructor
export const CFI_GOAL: TrainingGoalData = {
  id: 'CFI',
  name: 'Certified Flight Instructor',
  shortName: 'CFI',
  description: 'Teach flight training',
  icon: '👨‍🏫',
  totalHoursRequired: 250,
  category: 'airplane',
  prerequisites: ['CPL'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 250, unit: 'hours' },
    { key: 'picTime', label: 'PIC Time', description: 'Pilot in command time', required: 15, unit: 'hours' },
    { key: 'instrumentTime', label: 'Instrument Time', description: 'Actual instrument time', required: 10, unit: 'hours' },
  ],
  milestones: [
    { id: 'foi', title: 'Fundamentals of Instructing', description: 'FOI knowledge', order: 1, requirements: [] },
    { id: 'cfi-ground', title: 'CFI Ground School', description: 'Instructor fundamentals', order: 2, requirements: [] },
    { id: 'cfi-flight', title: 'CFI Flight Training', description: 'Learn to teach flight', order: 3, requirements: [] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 4, requirements: ['totalTime', 'picTime', 'instrumentTime'] },
  ],
};

// CFII - Instrument Instructor
export const CFII_GOAL: TrainingGoalData = {
  id: 'CFII',
  name: 'Instrument Instructor',
  shortName: 'CFII',
  description: 'Teach instrument rating courses',
  icon: '📈',
  totalHoursRequired: 15,
  category: 'airplane',
  prerequisites: ['CFI'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 15, unit: 'hours' },
    { key: 'instrumentTime', label: 'Instrument Time', description: 'Actual instrument time', required: 3, unit: 'hours' },
  ],
  milestones: [
    { id: 'cfii-ground', title: 'CFII Ground Training', description: 'Instrument teaching methods', order: 1, requirements: [] },
    { id: 'cfii-flight', title: 'CFII Flight Training', description: 'How to teach instrument', order: 2, requirements: ['instrumentTime'] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 3, requirements: ['totalTime', 'instrumentTime'] },
  ],
};

// MEI - Multi-Engine Instructor
export const MEI_GOAL: TrainingGoalData = {
  id: 'MEI',
  name: 'Multi-Engine Instructor',
  shortName: 'MEI',
  description: 'Teach multi-engine flying',
  icon: '✈️',
  totalHoursRequired: 15,
  category: 'airplane',
  prerequisites: ['CFI'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 15, unit: 'hours' },
    { key: 'multiTime', label: 'Multi-Engine Time', description: 'Multi-engine time', required: 3, unit: 'hours' },
  ],
  milestones: [
    { id: 'me-ground', title: 'Multi-Engine Ground', description: 'Multi-engine systems', order: 1, requirements: [] },
    { id: 'me-flight', title: 'Multi-Engine Training', description: 'Multi-engine flight training', order: 2, requirements: ['multiTime'] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 3, requirements: ['totalTime', 'multiTime'] },
  ],
};

// ATP - Airline Transport Pilot
export const ATP_GOAL: TrainingGoalData = {
  id: 'ATP',
  name: 'Airline Transport Pilot',
  shortName: 'ATP',
  description: 'Fly for airlines',
  icon: '🌐',
  totalHoursRequired: 1500,
  category: 'airplane',
  prerequisites: ['CPL'],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 1500, unit: 'hours' },
    { key: 'picTime', label: 'PIC Time', description: 'Pilot in command time', required: 500, unit: 'hours' },
    { key: 'crossCountry', label: 'Cross Country', description: 'Cross country time', required: 500, unit: 'hours' },
    { key: 'night', label: 'Night Flight', description: 'Night flight time', required: 75, unit: 'hours' },
    { key: 'instrumentTime', label: 'Instrument Time', description: 'Actual instrument time', required: 75, unit: 'hours' },
    { key: 'multiEngine', label: 'Multi-Engine Time', description: 'Multi-engine time', required: 250, unit: 'hours' },
  ],
  milestones: [
    { id: 'build-500', title: '500 Hours', description: 'Build time toward ATP', order: 1, requirements: ['picTime'] },
    { id: 'build-1000', title: '1000 Hours', description: 'Continue building time', order: 2, requirements: ['crossCountry'] },
    { id: 'build-1200', title: '1200 Hours', description: 'Restricted ATP at 1200 hours', order: 3, requirements: ['totalTime', 'multiEngine'] },
    { id: 'build-1500', title: '1500 Hours', description: 'Full ATP minimum', order: 4, requirements: ['totalTime', 'picTime', 'crossCountry', 'night', 'instrumentTime', 'multiEngine'] },
  ],
};

// HELICOPTER - Private Pilot Helicopter
export const HELICOPTER_GOAL: TrainingGoalData = {
  id: 'HELICOPTER',
  name: 'Private Pilot Helicopter',
  shortName: 'HPL',
  description: 'Fly helicopters for pleasure',
  icon: '🚁',
  totalHoursRequired: 40,
  category: 'helicopter',
  prerequisites: [],
  requirements: [
    { key: 'totalTime', label: 'Total Flight Time', description: 'Minimum total flight time', required: 40, unit: 'hours' },
    { key: 'soloTime', label: 'Solo Flight Time', description: 'Minimum solo flight time', required: 10, unit: 'hours' },
    { key: 'dualGiven', label: 'Dual Instruction', description: 'Flight training from instructor', required: 20, unit: 'hours' },
    { key: 'crossCountry', label: 'Cross Country', description: 'Minimum cross country time', required: 10, unit: 'hours' },
    { key: 'night', label: 'Night Flight', description: 'Minimum night flight time', required: 3, unit: 'hours' },
  ],
  milestones: [
    { id: 'orientation', title: 'Helicopter Orientation', description: 'Introduction to helicopter flight', order: 1, requirements: ['dualGiven'] },
    { id: 'hover', title: 'Hover Training', description: 'Mastering the hover', order: 2, requirements: [] },
    { id: 'surface', title: 'Surface Moves', description: 'Ground and hover taxi', order: 3, requirements: [] },
    { id: 'checkride', title: 'Checkride', description: 'Practical test with FAA examiner', order: 4, requirements: ['totalTime', 'soloTime', 'crossCountry', 'night'] },
  ],
};

// Export all goals as array
export const TRAINING_GOALS: TrainingGoalData[] = [
  PPL_GOAL,
  IR_GOAL,
  CPL_GOAL,
  CFI_GOAL,
  CFII_GOAL,
  MEI_GOAL,
  ATP_GOAL,
  HELICOPTER_GOAL,
];

// Helper function to get goal by ID
export function getGoalById(id: GoalType): TrainingGoalData | undefined {
  return TRAINING_GOALS.find(goal => goal.id === id);
}

// Helper function to check if prerequisites are met
export function arePrerequisitesMet(prerequisites: GoalType[], completedGoals: GoalType[]): boolean {
  if (prerequisites.length === 0) return true;
  return prerequisites.every(prereq => completedGoals.includes(prereq));
}

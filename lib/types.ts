export type ProficiencyLevel = 'learning' | 'familiar' | 'expert';

export interface Person {
  id: string;
  name: string;
  role?: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface Connection {
  person_id: string;
  skill_id: string;
  proficiency: ProficiencyLevel;
}

export interface GraphData {
  people: Person[];
  skills: Skill[];
  connections: Connection[];
}

import { GraphData, Person, Skill, Connection } from './types';

const STORAGE_KEY = 'team-skill-matrix';

export const seedData: GraphData = {
  people: [
    { id: 'p1', name: 'Shobha', role: 'Frontend Engineer' },
    { id: 'p2', name: 'Khushboo', role: 'Full-Stack Engineer' },
    { id: 'p3', name: 'Saurav', role: 'Backend Engineer' },
    { id: 'p4', name: 'Ram', role: 'Designer' },
    { id: 'p5', name: 'Shayam', role: 'DevOps Engineer' },
  ],
  skills: [
    { id: 's1', name: 'React', category: 'Frontend' },
    { id: 's2', name: 'TypeScript', category: 'Frontend' },
    { id: 's3', name: 'Node.js', category: 'Backend' },
    { id: 's4', name: 'PostgreSQL', category: 'Backend' },
    { id: 's5', name: 'Docker', category: 'DevOps' },
    { id: 's6', name: 'Figma', category: 'Design' },
    { id: 's7', name: 'CSS', category: 'Frontend' },
    { id: 's8', name: 'GraphQL', category: 'Backend' },
    { id: 's9', name: 'CI/CD', category: 'DevOps' },
    { id: 's10', name: 'Next.js', category: 'Frontend' },
  ],
  connections: [
    { person_id: 'p1', skill_id: 's1', proficiency: 'expert' },
    { person_id: 'p1', skill_id: 's2', proficiency: 'expert' },
    { person_id: 'p1', skill_id: 's10', proficiency: 'familiar' },
    { person_id: 'p1', skill_id: 's7', proficiency: 'familiar' },
    { person_id: 'p1', skill_id: 's6', proficiency: 'learning' },
    { person_id: 'p2', skill_id: 's1', proficiency: 'familiar' },
    { person_id: 'p2', skill_id: 's3', proficiency: 'expert' },
    { person_id: 'p2', skill_id: 's2', proficiency: 'familiar' },
    { person_id: 'p2', skill_id: 's4', proficiency: 'learning' },
    { person_id: 'p2', skill_id: 's10', proficiency: 'expert' },
    { person_id: 'p3', skill_id: 's3', proficiency: 'expert' },
    { person_id: 'p3', skill_id: 's4', proficiency: 'expert' },
    { person_id: 'p3', skill_id: 's8', proficiency: 'expert' },
    { person_id: 'p3', skill_id: 's5', proficiency: 'familiar' },
    { person_id: 'p3', skill_id: 's2', proficiency: 'learning' },
    { person_id: 'p4', skill_id: 's6', proficiency: 'expert' },
    { person_id: 'p4', skill_id: 's7', proficiency: 'familiar' },
    { person_id: 'p4', skill_id: 's1', proficiency: 'learning' },
    { person_id: 'p5', skill_id: 's5', proficiency: 'expert' },
    { person_id: 'p5', skill_id: 's9', proficiency: 'expert' },
    { person_id: 'p5', skill_id: 's3', proficiency: 'familiar' },
    { person_id: 'p5', skill_id: 's4', proficiency: 'familiar' },
  ],
};

export function loadData(): GraphData {
  if (typeof window === 'undefined') return seedData;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return seedData;
    }
  }
  return seedData;
}

export function saveData(data: GraphData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

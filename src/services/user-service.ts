
import type { User } from '@/lib/types';
import { badges } from '@/lib/badges';

const mockUsers: User[] = [
  { 
    id: 'user-1',
    name: 'Alex Johnson',
    avatarUrl: 'https://placehold.co/100x100.png',
    title: 'Senior Project Manager',
    badges: [badges[0], badges[1], badges[4]],
    score: 150,
  },
  { 
    id: 'user-2',
    name: 'Maria Garcia',
    avatarUrl: 'https://placehold.co/100x100.png',
    title: 'Risk Analyst',
    badges: [badges[0], badges[2]],
    score: 120,
  },
  {
    id: 'user-3',
    name: 'David Smith',
    avatarUrl: 'https://placehold.co/100x100.png',
    title: 'Lead Developer',
    badges: [badges[1]],
    score: 90,
  },
    {
    id: 'user-4',
    name: 'Emily White',
    avatarUrl: 'https://placehold.co/100x100.png',
    title: 'QA Engineer',
    badges: [badges[0], badges[3]],
    score: 110,
  },
  {
    id: 'user-5',
    name: 'Michael Brown',
    avatarUrl: 'https://placehold.co/100x100.png',
    title: 'Product Owner',
    badges: [],
    score: 30,
  },
];


// In a real app, this would fetch data from a database.
// For now, we'll use mock data.

export async function getUsers(): Promise<User[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers.sort((a, b) => b.score - a.score);
}

export async function getUser(userId: string): Promise<User | undefined> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUsers.find(user => user.id === userId);
}

// Get the currently "logged in" user. For this mock, it's always user-1.
export async function getCurrentUser(): Promise<User | undefined> {
    return getUser('user-1');
}

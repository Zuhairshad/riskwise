
import type { Badge } from "@/lib/types";
import { BadgeCheck, Zap, ShieldCheck, HeartHandshake, Crown } from "lucide-react";

export const badges: Badge[] = [
    {
        id: 'on-time-closer',
        name: 'On-Time Closer',
        description: 'Awarded for closing risks or issues on or before the due date.',
        icon: BadgeCheck,
        color: "text-green-500",
    },
    {
        id: 'prompt-updater',
        name: 'Prompt Updater',
        description: 'Awarded for consistently providing status updates ahead of reminders.',
        icon: Zap,
        color: "text-blue-500",
    },
    {
        id: 'consistent-closer',
        name: 'Consistent Closer',
        description: 'Awarded for closing 5 or more items on time consecutively.',
        icon: ShieldCheck,
        color: "text-purple-500",
    },
    {
        id: 'team-helper',
        name: 'Team Helper',
        description: 'Awarded for contributing to risks or issues owned by others.',
        icon: HeartHandshake,
        color: "text-pink-500",
    },
    {
        id: 'top-performer',
        name: 'Top Performer',
        description: 'Awarded for being in the top 10% of the leaderboard for a month.',
        icon: Crown,
        color: "text-yellow-500",
    }
];

export const getBadgeById = (id: string) => badges.find(b => b.id === id);

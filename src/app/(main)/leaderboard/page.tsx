
import { getUsers } from '@/services/user-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Trophy } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-yellow-600';
    return 'text-muted-foreground';
};

const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-6 h-6" />;
    if (rank === 1) return <Medal className="w-6 h-6" />;
    if (rank === 2) return <Trophy className="w-6 h-6" />;
    return <span className="font-bold text-lg w-6 text-center">{rank + 1}</span>;
}

export default async function LeaderboardPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">
                    See who is leading the pack in proactive risk management.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Ranked by total points earned from timely updates and closures.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <TooltipProvider>
                            {users.map((user, index) => (
                                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`flex items-center justify-center w-10 ${getRankColor(index)}`}>
                                        {getRankIcon(index)}
                                    </div>
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.photoURL} alt={user.displayName} data-ai-hint="user avatar" />
                                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{user.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{user.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user.badges?.slice(0, 3).map(badge => (
                                             <Tooltip key={badge.id}>
                                                <TooltipTrigger>
                                                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{badge.name}</p>
                                                    <p>{badge.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                        {user.badges && user.badges.length > 3 && (
                                            <UiBadge variant="secondary">+{user.badges.length - 3}</UiBadge>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{user.score.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Points</p>
                                    </div>
                                </div>
                            ))}
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

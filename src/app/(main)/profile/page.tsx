
import { getCurrentUser } from '@/services/user-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { badges } from '@/lib/badges';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        return <div>User not found.</div>;
    }

    const earnedBadgeIds = new Set(user.badges.map(b => b.id));

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <div className="bg-muted h-32" />
                <CardHeader className="flex flex-col items-center text-center -mt-16">
                     <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl mt-4">{user.name}</CardTitle>
                    <CardDescription>{user.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="flex justify-center gap-8 text-muted-foreground">
                        <div>
                            <p className="text-2xl font-bold text-foreground">{user.score}</p>
                            <p>Total Points</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{user.badges.length}</p>
                            <p>Badges Earned</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Badge Collection</CardTitle>
                    <CardDescription>All available badges and your progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {badges.map(badge => {
                                const hasBadge = earnedBadgeIds.has(badge.id);
                                return (
                                     <Tooltip key={badge.id}>
                                        <TooltipTrigger asChild>
                                            <div className={cn(
                                                "flex flex-col items-center justify-center p-4 border rounded-lg text-center space-y-2 transition-all",
                                                hasBadge ? "bg-accent/10 border-accent" : "bg-muted/50 opacity-60"
                                            )}>
                                                <div className="relative">
                                                    <badge.icon className={cn("h-16 w-16", hasBadge ? badge.color : "text-muted-foreground")} />
                                                    {hasBadge && <Check className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full h-5 w-5 p-0.5" />}
                                                </div>
                                                <p className={cn("font-semibold", hasBadge ? "text-foreground" : "text-muted-foreground")}>{badge.name}</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{badge.name}</p>
                                            <p>{badge.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </div>
    );
}

// src/components/profile/profile-header.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";

interface ProfileHeaderProps {
    profile: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
    };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const { logout } = useAuth();
    const displayName = profile.displayName || profile.handle;

    return (
        <Card>
            <CardHeader className="space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={displayName} />
                    <AvatarFallback>
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <p className="text-sm text-muted-foreground">
                        @{profile.handle}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <Button onClick={logout} variant="outline" className="w-full">
                    Logout
                </Button>
            </CardContent>
        </Card>
    );
}

// src/components/profile/profile-header.tsx
import { Avatar } from "@/components/ui/avatar";
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

    return (
        <Card>
            <CardHeader className="space-y-4">
                <Avatar
                    src={profile.avatar}
                    alt={profile.displayName || profile.handle}
                    className="h-24 w-24"
                />
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">
                        {profile.displayName || profile.handle}
                    </h2>
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


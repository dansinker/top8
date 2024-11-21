// src/components/top8/top8-list.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTop8Manager } from "@/lib/hooks/useTop8Manager";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

interface Friend {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
}

export function Top8List({ did }: { did?: string }) {
    const { profile } = useAuth();
    const { friends, loading, error, searchFollows, saveFriends } = useTop8Manager(did);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [searching, setSearching] = useState(false);
    
    // Only show edit capabilities if viewing own profile
    const isOwnProfile = !did || did === profile?.did;

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const results = await searchFollows(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddFriend = async (friend: Friend) => {
        if (friends.length >= 8) {
            alert("You can only have 8 friends in your list!");
            return;
        }

        try {
            const newFriends = [...friends, friend];
            await saveFriends(newFriends);
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading top 8...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top 8 Friends</CardTitle>
                {isOwnProfile && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Add Friend</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add to Top 8</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Search by handle or name..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {searching ? (
                                        <div>Searching...</div>
                                    ) : (
                                        searchResults.map((result) => (
                                            <div
                                                key={result.did}
                                                className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={result.avatar}
                                                            alt={result.displayName}
                                                        />
                                                        <AvatarFallback>
                                                            {result.displayName
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {result.displayName}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            @{result.handle}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddFriend(result)
                                                    }
                                                    disabled={friends.some(
                                                        (f) =>
                                                            f.did === result.did,
                                                    )}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {friends.map((friend) => (
                        <Link
                            key={friend.did}
                            href={`/profile/${friend.did}`}
                            className="flex flex-col items-center space-y-2"
                        >
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={friend.avatar}
                                    alt={friend.displayName}
                                />
                                <AvatarFallback>
                                    {friend.displayName
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-center">
                                {friend.displayName}
                            </span>
                        </Link>
                    ))}
                    {Array.from({ length: 8 - friends.length }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex flex-col items-center justify-center h-32 bg-muted rounded-lg"
                        >
                            <span className="text-muted-foreground">Empty</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
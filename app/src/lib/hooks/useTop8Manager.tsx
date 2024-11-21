import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

interface Friend {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
}

interface FollowsCache {
    data: Friend[];
    timestamp: number;
    expiration: number;
}

export function useTop8Manager() {
    const { accessJwt } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [followsCache, setFollowsCache] = useState<FollowsCache | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

    const isCacheValid = (cache: FollowsCache | null): boolean => {
        return !!(
            cache &&
            cache.data &&
            cache.timestamp &&
            Date.now() - cache.timestamp < cache.expiration
        );
    };

    const loadAllFollows = async (): Promise<Friend[]> => {
        if (!accessJwt) throw new Error("Authentication required");

        const follows: Friend[] = [];
        let cursor: string | undefined;

        try {
            do {
                const params = new URLSearchParams();
                params.append("actor", "me");
                params.append("limit", "100");
                if (cursor) {
                    params.append("cursor", cursor);
                }

                const response = await fetch(
                    `https://bsky.social/xrpc/app.bsky.graph.getFollows?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessJwt}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                follows.push(...(data.follows || []));
                cursor = data.cursor;
            } while (cursor);

            // Format follows for consistent structure
            const formattedFollows = follows.map((follow) => ({
                did: follow.did,
                handle: follow.handle,
                displayName: follow.displayName || follow.handle,
                avatar: follow.avatar,
            }));

            // Update cache
            setFollowsCache({
                data: formattedFollows,
                timestamp: Date.now(),
                expiration: CACHE_EXPIRATION,
            });

            return formattedFollows;
        } catch (error) {
            console.error("Error loading follows:", error);
            throw error;
        }
    };

    const searchFollows = async (query: string): Promise<Friend[]> => {
        try {
            // Load or refresh cache if needed
            let follows = followsCache?.data || [];
            if (!isCacheValid(followsCache)) {
                follows = await loadAllFollows();
            }

            const searchQuery = query.toLowerCase();
            return follows.filter(
                (follow) =>
                    follow.handle.toLowerCase().includes(searchQuery) ||
                    follow.displayName.toLowerCase().includes(searchQuery),
            );
        } catch (error) {
            console.error("Error searching follows:", error);
            throw error;
        }
    };

    const saveFriends = async (newFriends: Friend[]) => {
        if (!accessJwt) throw new Error("Authentication required");
        if (!Array.isArray(newFriends) || newFriends.length > 8) {
            throw new Error("Invalid friends list - maximum 8 friends allowed");
        }

        try {
            const record = {
                friends: newFriends,
                createdAt: new Date().toISOString(),
                $type: "app.bsky.graph.listitem",
            };

            const response = await fetch(
                "https://bsky.social/xrpc/com.atproto.repo.putRecord",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessJwt}`,
                    },
                    body: JSON.stringify({
                        repo: "me",
                        collection: "app.bsky.graph.listitem",
                        rkey: "top8list",
                        record,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to save friends: ${response.statusText}`,
                );
            }

            setFriends(newFriends);
            return true;
        } catch (error) {
            console.error("Error saving friends:", error);
            throw error;
        }
    };

    const clearCache = () => {
        setFollowsCache(null);
    };

    // Load initial friends list
    useEffect(() => {
        const initialize = async () => {
            if (!accessJwt) {
                setLoading(false);
                return;
            }

            try {
                // Get the user's DID from the auth context
                // if did is null than abort
                //
                const params = new URLSearchParams({
                    // repo: did, // Using the DID from auth context
                    did: "me",
                    collection: "app.bsky.graph.listitem",
                    rkey: "top8list",
                });

                const response = await fetch(
                    `https://bsky.social/xrpc/com.atproto.repo.getRecord?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessJwt}`,
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    setFriends(data.value.friends || []);
                }
            } catch (error) {
                console.error("Error initializing friends:", error);
                setError("Failed to load friends list");
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [accessJwt]);

    return {
        friends,
        loading,
        error,
        searchFollows,
        saveFriends,
        clearCache,
    };
}

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

interface Friend {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
    uniqueId?: string;
    position?: number;
}

interface FollowsCache {
    data: Friend[];
    timestamp: number;
    expiration: number;
}

// These would normally come from CONFIG
const CONFIG = {
    TOP8: {
        RECORD_TYPE: "app.top8.space.list",
        RECORD_KEY: "self",
        MAX_FRIENDS: 8,
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        LIST_PURPOSE: "Top 8 Friends",
    },
};

export function useTop8Manager(viewDid?: string) {
    const { accessJwt, profile } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [followsCache, setFollowsCache] = useState<FollowsCache | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCacheValid = (cache: FollowsCache | null): boolean => {
        return !!(
            cache &&
            cache.data &&
            cache.timestamp &&
            Date.now() - cache.timestamp < CONFIG.TOP8.CACHE_DURATION
        );
    };

    const loadAllFollows = async (): Promise<Friend[]> => {
        if (!accessJwt || !profile?.did)
            throw new Error("Authentication required");

        const follows: Friend[] = [];
        let cursor: string | undefined;

        try {
            do {
                const url = new URL(
                    "https://bsky.social/xrpc/app.bsky.graph.getFollows",
                );
                url.searchParams.append("actor", profile.did);
                url.searchParams.append("limit", "100");
                if (cursor) {
                    url.searchParams.append("cursor", cursor);
                }

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessJwt}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                follows.push(...(data.follows || []));
                cursor = data.cursor;

                console.debug(
                    `[Top8Manager] Loaded ${follows.length} follows so far...`,
                );
            } while (cursor);

            // Format follows for consistent structure
            const formattedFollows = follows.map((follow, index) => ({
                did: follow.did,
                handle: follow.handle,
                displayName: follow.displayName || follow.handle,
                avatar: follow.avatar,
                uniqueId: `${follow.did}-${Date.now()}-${index}`,
            }));

            // Update cache
            setFollowsCache({
                data: formattedFollows,
                timestamp: Date.now(),
                expiration: CONFIG.TOP8.CACHE_DURATION,
            });

            console.debug(
                `[Top8Manager] Cached ${formattedFollows.length} total follows`,
            );
            return formattedFollows;
        } catch (error) {
            console.error("[Top8Manager] Error loading follows:", error);
            throw error;
        }
    };

    const searchFollows = async (query: string): Promise<Friend[]> => {
        if (!accessJwt) throw new Error("Authentication required");

        try {
            // Load or refresh cache if needed
            if (!isCacheValid(followsCache)) {
                await loadAllFollows();
            }

            const searchQuery = query.toLowerCase();

            // Search through cached follows with unique IDs
            const results = (followsCache?.data || [])
                .filter(
                    (follow) =>
                        follow.handle.toLowerCase().includes(searchQuery) ||
                        (follow.displayName &&
                            follow.displayName
                                .toLowerCase()
                                .includes(searchQuery)),
                )
                .map((follow, index) => ({
                    ...follow,
                    uniqueId: `${follow.did}-${Date.now()}-${index}`,
                }));

            console.debug(
                `[Top8Manager] Found ${results.length} matches for "${query}"`,
            );
            return results;
        } catch (error) {
            console.error("[Top8Manager] Error searching follows:", error);
            throw error;
        }
    };

    const saveFriends = async (newFriends: Friend[]) => {
        if (!accessJwt || !profile?.did)
            throw new Error("Authentication required");
        if (
            !Array.isArray(newFriends) ||
            newFriends.length > CONFIG.TOP8.MAX_FRIENDS
        ) {
            throw new Error(
                `Invalid friends list - maximum ${CONFIG.TOP8.MAX_FRIENDS} friends allowed`,
            );
        }

        try {
            const record = {
                purpose: CONFIG.TOP8.LIST_PURPOSE,
                name: "My Top 8 Friends",
                description: "My closest friends on Bluesky",
                items: newFriends.map((friend, index) => ({
                    subject: friend.did,
                    handle: friend.handle,
                    displayName: friend.displayName,
                    avatar: friend.avatar,
                    position: index,
                    uniqueId:
                        friend.uniqueId ||
                        `${friend.did}-${Date.now()}-${index}`,
                })),
                createdAt: new Date().toISOString(),
                $type: CONFIG.TOP8.RECORD_TYPE,
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
                        repo: profile.did,
                        collection: CONFIG.TOP8.RECORD_TYPE,
                        rkey: CONFIG.TOP8.RECORD_KEY,
                        record,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    `Failed to save friends: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ""}`,
                );
            }

            setFriends(newFriends);
            return true;
        } catch (error) {
            console.error("[Top8Manager] Error saving friends:", error);
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

            const targetDid = viewDid || profile?.did;
            if (!targetDid) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://bsky.social/xrpc/com.atproto.repo.getRecord?${new URLSearchParams(
                        {
                            repo: targetDid,
                            collection: CONFIG.TOP8.RECORD_TYPE,
                            rkey: CONFIG.TOP8.RECORD_KEY,
                        },
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessJwt}`,
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    // Add unique identifiers to each friend
                    const friendsList = data?.value?.items || [];
                    const friendsWithIds = friendsList.map((friend: {subject: string}, index: number) => ({
                        ...friend,
                        uniqueId: `${friend.subject}-${index}`,
                        position: index,
                    }));
                    setFriends(friendsWithIds);
                } else if (response.status === 404) {
                    // This is normal for users who haven't set up their Top 8
                    setFriends([]);
                } else {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(
                        `Failed to load friends: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ""}`,
                    );
                }
            } catch (error) {
                console.error(
                    "[Top8Manager] Error initializing friends:",
                    error,
                );
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load friends list",
                );
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [accessJwt, profile?.did, viewDid]);

    return {
        friends,
        loading,
        error,
        searchFollows,
        saveFriends,
        clearCache,
    };
}

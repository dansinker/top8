// src/components/posts/user-posts.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Post {
    uri: string;
    text: string;
    createdAt: string;
}

interface FeedItem {
    post: {
        uri: string;
        record: {
            text: string;
            createdAt: string;
            reply?: unknown;
            repost?: unknown;
        };
    };
}

export function UserPosts({ did }: { did: string }) {
    const { accessJwt } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(
                    `https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=${did}`,
                    {
                        headers: accessJwt
                            ? {
                                  Authorization: `Bearer ${accessJwt}`,
                              }
                            : undefined,
                    },
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const data = await response.json();
                // Transform the feed data into our Post format
                const transformed = (data.feed as FeedItem[])
                    .filter(
                        (item) =>
                            !item.post.record.reply && !item.post.record.repost,
                    )
                    .map((item) => ({
                        uri: item.post.uri,
                        text: item.post.record.text,
                        createdAt: item.post.record.createdAt,
                    }));
                setPosts(transformed);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [did, accessJwt]);

    if (loading) {
        return <div>Loading posts...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post.uri}
                            className="border-b pb-4 last:border-0"
                        >
                            <p className="whitespace-pre-wrap">{post.text}</p>
                            <span className="text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

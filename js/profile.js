class ProfileManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.profile = null;
    }

    async fetchProfile(handle) {
        try {
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GET_PROFILE}?actor=${handle}`,
                { headers: this.authManager.getAuthHeaders() },
            );

            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();
            this.profile = this.formatProfileData(data);
            return this.profile;
        } catch (error) {
            console.error("Profile fetch error:", error);
            throw error;
        }
    }

    formatProfileData(data) {
        return {
            name: data.displayName || data.handle,
            bsky_handle: data.handle,
            bsky_url: `https://bsky.app/profile/${data.handle}`,
            bsky_did: data.did,
            avatar: data.avatar,
            note: data.description,
        };
    }

    async fetchPosts(handle, limit = 12) {
        try {
            const response = await fetch(
                `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${handle}&limit=${limit}`,
                { headers: this.authManager.getAuthHeaders() },
            );

            if (!response.ok) throw new Error("Failed to fetch posts");

            const data = await response.json();
            return this.formatPosts(data.feed);
        } catch (error) {
            console.error("Posts fetch error:", error);
            throw error;
        }
    }

    formatPosts(feed) {
        return feed
            .filter(
                (item) => !item.post.record.reply && !item.post.record.repost,
            )
            .map((item) => ({
                text: item.post.record.text,
                createdAt: new Date(
                    item.post.record.createdAt,
                ).toLocaleString(),
                author: {
                    name:
                        item.post.author.displayName || item.post.author.handle,
                    handle: item.post.author.handle,
                    avatar: item.post.author.avatar,
                },
                // Add engagement metrics
                replyCount: item.post.replyCount || 0,
                repostCount: item.post.repostCount || 0,
                likeCount: item.post.likeCount || 0,
                // Add embed handling if present
                embed: this.formatEmbed(item.post.embed),
                // Add original URI for linking
                uri: item.post.uri,
                // Add cid for unique identification
                cid: item.post.cid,
            }));
    }

    formatEmbed(embed) {
        if (!embed) return null;

        // Handle images
        if (embed.images) {
            return {
                type: "images",
                images: embed.images.map((img) => ({
                    url: img.thumb || img.fullsize,
                    alt: img.alt,
                })),
            };
        }

        // Handle external links
        if (embed.external) {
            return {
                type: "external",
                url: embed.external.uri,
                title: embed.external.title,
                description: embed.external.description,
                thumb: embed.external.thumb,
            };
        }

        // Handle record embeds (quotes, etc)
        if (embed.record) {
            return {
                type: "record",
                record: {
                    text: embed.record.value.text,
                    author: embed.record.author,
                },
            };
        }

        return null;
    }
}

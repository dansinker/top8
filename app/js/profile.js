class ProfileManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.profile = null;
    }

    async fetchProfile(handle) {
        console.debug(
            `[ProfileManager] Fetching profile for handle: ${handle}`,
        );

        if (!handle) {
            console.error("[ProfileManager] No handle provided");
            throw new Error("Handle is required");
        }

        try {
            const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GET_PROFILE}?actor=${encodeURIComponent(handle)}`;
            console.debug(`[ProfileManager] Making request to: ${url}`);

            const headers = this.authManager.getAuthHeaders();
            console.debug("[ProfileManager] Request headers:", headers);

            const response = await fetch(url, { headers });
            console.debug(
                `[ProfileManager] Response status: ${response.status}`,
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    `[ProfileManager] Failed to fetch profile. Status: ${response.status}, Error: ${errorText}`,
                );
                throw new Error(
                    `Failed to fetch profile: ${response.status} ${response.statusText}`,
                );
            }

            const data = await response.json();
            console.debug("[ProfileManager] Raw profile data:", data);

            if (!data || typeof data !== "object") {
                console.error("[ProfileManager] Invalid profile data received");
                throw new Error("Invalid profile data received");
            }

            this.profile = this.formatProfileData(data);
            console.debug("[ProfileManager] Formatted profile:", this.profile);

            return this.profile;
        } catch (error) {
            console.error("[ProfileManager] Profile fetch error:", {
                handle,
                error: error.message,
                stack: error.stack,
            });
            throw new Error(
                `Failed to fetch profile for ${handle}: ${error.message}`,
            );
        }
    }

    formatProfileData(data) {
        console.debug("[ProfileManager] Formatting profile data:", data);

        // Validate input data
        if (!data || typeof data !== "object") {
            console.error("[ProfileManager] Invalid data object received");
            throw new Error("Invalid profile data object");
        }

        // Validate required fields
        if (!data.handle) {
            console.error("[ProfileManager] Missing required handle field");
            throw new Error("Profile data missing required handle field");
        }

        if (!data.did) {
            console.error("[ProfileManager] Missing required DID field");
            throw new Error("Profile data missing required DID field");
        }

        // Safely access optional fields
        const displayName = data.displayName?.trim() || null;
        const handle = data.handle?.trim();
        const avatar = data.avatar || null;
        const description = data.description?.trim() || null;

        console.debug("[ProfileManager] Extracted profile fields:", {
            displayName,
            handle,
            avatar,
            description,
        });

        const formattedProfile = {
            name: displayName || handle, // Fallback to handle if no display name
            bsky_handle: handle,
            bsky_url: `https://bsky.app/profile/${encodeURIComponent(handle)}`,
            bsky_did: data.did,
            avatar: avatar,
            note: description,
            raw: data, // Store raw data for debugging
        };

        console.debug("[ProfileManager] Formatted profile:", formattedProfile);
        return formattedProfile;
    }

    // async fetchPosts(handle, limit = 12) {
    //     try {
    //         const response = await fetch(
    //             `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${handle}&limit=${limit}`,
    //             { headers: this.authManager.getAuthHeaders() },
    //         );

    //         if (!response.ok) throw new Error("Failed to fetch posts");

    //         const data = await response.json();
    //         return this.formatPosts(data.feed);
    //     } catch (error) {
    //         console.error("Posts fetch error:", error);
    //         throw error;
    //     }
    // }

    // formatPosts(feed) {
    //     return feed
    //         .filter(
    //             (item) => !item.post.record.reply && !item.post.record.repost,
    //         )
    //         .map((item) => ({
    //             text: item.post.record.text,
    //             createdAt: new Date(
    //                 item.post.record.createdAt,
    //             ).toLocaleString(),
    //             author: {
    //                 name:
    //                     item.post.author.displayName || item.post.author.handle,
    //                 handle: item.post.author.handle,
    //                 avatar: item.post.author.avatar,
    //             },
    //             // Add engagement metrics
    //             replyCount: item.post.replyCount || 0,
    //             repostCount: item.post.repostCount || 0,
    //             likeCount: item.post.likeCount || 0,
    //             // Add embed handling if present
    //             embed: this.formatEmbed(item.post.embed),
    //             // Add original URI for linking
    //             uri: item.post.uri,
    //             // Add cid for unique identification
    //             cid: item.post.cid,
    //         }));
    // }

    // formatEmbed(embed) {
    //     if (!embed) return null;

    //     // Handle images
    //     if (embed.images) {
    //         return {
    //             type: "images",
    //             images: embed.images.map((img) => ({
    //                 url: img.thumb || img.fullsize,
    //                 alt: img.alt,
    //             })),
    //         };
    //     }

    //     // Handle external links
    //     if (embed.external) {
    //         return {
    //             type: "external",
    //             url: embed.external.uri,
    //             title: embed.external.title,
    //             description: embed.external.description,
    //             thumb: embed.external.thumb,
    //         };
    //     }

    //     // Handle record embeds (quotes, etc)
    //     if (embed.record) {
    //         return {
    //             type: "record",
    //             record: {
    //                 text: embed.record.value.text,
    //                 author: embed.record.author,
    //             },
    //         };
    //     }

    //     return null;
    // }
}

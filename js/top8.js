class Top8Manager {
    constructor(authManager) {
        if (!authManager) {
            throw new Error("[Top8Manager] AuthManager is required");
        }
        this.pds = new PDSRecordManager(authManager);
        this.recordType = "app.bsky.graph.listitem";
        this.recordKey = "top8list";

        // Add cache for follows
        this.followsCache = null;
        this.lastCacheUpdate = null;
        this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
    }

    async initialize() {
        console.debug("[Top8Manager] Starting initialization...");
        try {
            const record = await this.pds.getRecord(
                this.recordType,
                this.recordKey,
            );
            // Extract list from record using ref key
            return record?.friends || [];
        } catch (error) {
            console.error("[Top8Manager] Initialization error:", error);
            return [];
        }
    }

    async loadAllFollows() {
        console.debug("[Top8Manager] Loading all follows...");
        const follows = [];
        let cursor = null;

        try {
            do {
                const url = new URL(
                    `${CONFIG.API.PUBLIC_URL}/app.bsky.graph.getFollows`,
                );
                url.searchParams.append("actor", this.pds.authManager.did);
                url.searchParams.append("limit", "100");
                if (cursor) {
                    url.searchParams.append("cursor", cursor);
                }

                const response = await fetch(url);
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
            this.followsCache = follows.map((follow) => ({
                did: follow.did,
                handle: follow.handle,
                displayName: follow.displayName || follow.handle,
                avatar: follow.avatar,
            }));

            this.lastCacheUpdate = Date.now();
            console.debug(
                `[Top8Manager] Cached ${this.followsCache.length} total follows`,
            );

            return this.followsCache;
        } catch (error) {
            console.error("[Top8Manager] Error loading all follows:", error);
            throw error;
        }
    }

    isCacheValid() {
        return (
            this.followsCache &&
            this.lastCacheUpdate &&
            Date.now() - this.lastCacheUpdate < this.cacheExpiration
        );
    }

    async searchFollows(query) {
        console.debug("[Top8Manager] Searching follows:", query);

        try {
            // Load or refresh cache if needed
            if (!this.isCacheValid()) {
                await this.loadAllFollows();
            }

            const searchQuery = query.toLowerCase();

            // Search through cached follows
            const results = this.followsCache.filter(
                (follow) =>
                    follow.handle.toLowerCase().includes(searchQuery) ||
                    (follow.displayName &&
                        follow.displayName.toLowerCase().includes(searchQuery)),
            );

            console.debug(
                `[Top8Manager] Found ${results.length} matches for "${query}"`,
            );
            return results;
        } catch (error) {
            console.error("[Top8Manager] Error searching follows:", error);
            throw error;
        }
    }

    async saveFriends(friends) {
        console.debug("[Top8Manager] Saving friends:", friends);

        if (!Array.isArray(friends) || friends.length > 8) {
            throw new Error("Invalid friends list - maximum 8 friends allowed");
        }

        try {
            // Create a record for each friend in the top 8
            for (let i = 0; i < friends.length; i++) {
                const friend = friends[i];
                const record = {
                    subject: friend.did, // Use the friend's DID as the subject
                    list: "app.bsky.graph.top8", // Indicate this is a top8 list
                    position: i, // Store the position in the top 8
                    createdAt: new Date().toISOString(),
                    $type: this.recordType,
                };

                // Use a unique key for each friend in the list
                const friendKey = `top8list-${i}`;
                await this.pds.putRecord(this.recordType, friendKey, record);
            }

            // Store the complete list for our reference
            const listRecord = {
                $type: "app.bsky.graph.list",
                friends: friends,
                createdAt: new Date().toISOString(),
            };
            await this.pds.putRecord("app.bsky.graph.list", "top8", listRecord);

            return true;
        } catch (error) {
            console.error("[Top8Manager] Error saving friends:", error);
            throw error;
        }
    }

    clearCache() {
        this.followsCache = null;
        this.lastCacheUpdate = null;
    }
}

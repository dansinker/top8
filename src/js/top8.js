import { PDSRecordManager } from "./pds";
import { CONFIG } from "./config";

export class Top8Manager {
  constructor(authManager) {
    if (!authManager) {
      throw new Error("[Top8Manager] AuthManager is required");
    }
    this.pds = new PDSRecordManager(authManager);

    // Use config values
    this.recordType = CONFIG.TOP8.RECORD_TYPE;
    this.recordKey = CONFIG.TOP8.RECORD_KEY;

    // Add cache for follows
    this.followsCache = null;
    this.lastCacheUpdate = null;
    this.cacheExpiration = CONFIG.TOP8.CACHE_DURATION;
  }

  async initialize() {
    console.debug("[Top8Manager] Starting initialization...");
    try {
      const record = await this.pds.getRecord(this.recordType, this.recordKey);
      // Add unique identifiers to each friend
      const friends = record?.items || [];
      return friends.map((friend, index) => ({
        ...friend,
        uniqueId: `${friend.did}-${index}`,
        position: index,
      }));
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
      if (!this.isCacheValid()) {
        await this.loadAllFollows();
      }

      const searchQuery = query.toLowerCase();

      // Add unique IDs to search results
      const results = this.followsCache
        .filter(
          (follow) =>
            follow.handle.toLowerCase().includes(searchQuery) ||
            (follow.displayName &&
              follow.displayName.toLowerCase().includes(searchQuery)),
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
  }

  async saveFriends(friends) {
    console.debug("[Top8Manager] Saving friends:", friends);

    if (!Array.isArray(friends) || friends.length > CONFIG.TOP8.MAX_FRIENDS) {
      throw new Error(
        `Invalid friends list - maximum ${CONFIG.TOP8.MAX_FRIENDS} friends allowed`,
      );
    }

    try {
      const record = {
        purpose: CONFIG.TOP8.LIST_PURPOSE,
        name: "My Top 8 Friends",
        description: "My closest friends on Bluesky",
        items: friends.map((friend, index) => ({
          subject: friend.did,
          handle: friend.handle,
          displayName: friend.displayName,
          avatar: friend.avatar,
          position: index,
          uniqueId: friend.uniqueId || `${friend.did}-${Date.now()}-${index}`,
        })),
        createdAt: new Date().toISOString(),
        $type: this.recordType,
      };

      await this.pds.putRecord(this.recordType, this.recordKey, record);
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

// Constants and Configuration
export const CONFIG = {
  API: {
    BASE_URL: "https://bsky.social/xrpc",
    PUBLIC_URL: "https://public.api.bsky.app/xrpc",
    ENDPOINTS: {
      CREATE_SESSION: "/com.atproto.server.createSession",
      REFRESH_SESSION: "/com.atproto.server.refreshSession",
      GET_PROFILE: "/app.bsky.actor.getProfile",
      GET_AUTHOR_FEED: "/app.bsky.feed.getAuthorFeed",
    },
  },
  STORAGE_KEYS: {
    AUTH: "bluesky_auth",
    THEME: "top8_theme",
  },
  THEME: {
    RECORD_TYPE: "app.top8.theme",
    RECORD_KEY: "self",
  },
  TOP8: {
    RECORD_TYPE: "app.bsky.graph.list", // Using the standard list type
    RECORD_KEY: "top8friends",
    LIST_PURPOSE: "app.bsky.graph.top8",
    MAX_FRIENDS: 8,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  },
};

// Constants and Configuration
const CONFIG = {
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
};

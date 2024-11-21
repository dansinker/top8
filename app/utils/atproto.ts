// utils/atproto.ts
import { BskyAgent } from "@atproto/api";

// Record types
const RECORD_TYPES = {
    THEME: "app.bsky.top8.theme",
    MUSIC: "app.bsky.top8.music",
    TOP8: "app.bsky.top8.friends",
} as const;

export const getRecord = async (
    agent: BskyAgent,
    did: string,
    collection: string,
) => {
    try {
        const response = await agent.com.atproto.repo.listRecords({
            repo: did,
            collection,
        });

        if (response.data.records.length > 0) {
            return response.data.records[0];
        }
        return null;
    } catch (error) {
        console.error(`Failed to get record from ${collection}:`, error);
        return null;
    }
};

export const createRecord = async (
    agent: BskyAgent,
    collection: string,
    record: any,
) => {
    try {
        await agent.com.atproto.repo.putRecord({
            repo: agent.session!.did,
            collection,
            rkey: "self",
            record,
        });
        return true;
    } catch (error) {
        console.error(`Failed to create record in ${collection}:`, error);
        return false;
    }
};

export const updateRecord = async (
    agent: BskyAgent,
    collection: string,
    record: any,
) => {
    try {
        const existing = await getRecord(agent, agent.session!.did, collection);
        if (existing) {
            await agent.com.atproto.repo.putRecord({
                repo: agent.session!.did,
                collection,
                rkey: existing.rkey,
                record: {
                    ...record,
                    createdAt: existing.value.createdAt,
                },
            });
        } else {
            await createRecord(agent, collection, {
                ...record,
                createdAt: new Date().toISOString(),
            });
        }
        return true;
    } catch (error) {
        console.error(`Failed to update record in ${collection}:`, error);
        return false;
    }
};

// Helper to get theme record
export const getThemeRecord = async (agent: BskyAgent, did: string) => {
    return getRecord(agent, did, RECORD_TYPES.THEME);
};

// Helper to get music services record
export const getMusicRecord = async (agent: BskyAgent, did: string) => {
    return getRecord(agent, did, RECORD_TYPES.MUSIC);
};

// Helper to get top 8 record
export const getTop8Record = async (agent: BskyAgent, did: string) => {
    return getRecord(agent, did, RECORD_TYPES.TOP8);
};

// Helper to update theme
export const updateThemeRecord = async (
    agent: BskyAgent,
    baseColor: string,
) => {
    return updateRecord(agent, RECORD_TYPES.THEME, {
        baseColor,
        lastUpdated: new Date().toISOString(),
    });
};

// Helper to update music services
export const updateMusicRecord = async (
    agent: BskyAgent,
    services: {
        spotify?: string;
        appleMusic?: string;
        amazonMusic?: string;
    },
) => {
    return updateRecord(agent, RECORD_TYPES.MUSIC, {
        services,
        lastUpdated: new Date().toISOString(),
    });
};

// Helper to update top 8
export const updateTop8Record = async (agent: BskyAgent, dids: string[]) => {
    return updateRecord(agent, RECORD_TYPES.TOP8, {
        dids,
        lastUpdated: new Date().toISOString(),
    });
};

// Helper to format profile data
export const formatProfileData = (profile: any) => {
    return {
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName || profile.handle,
        avatar: profile.avatar,
        bio: profile.description || "",
        lastLoginDate: profile.indexedAt,
    };
};

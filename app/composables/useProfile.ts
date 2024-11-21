// composables/useProfile.ts
import { reactive, readonly } from "vue";
import { useAuth } from "./useAuth";

interface MusicServices {
    spotify?: string;
    appleMusic?: string;
    amazonMusic?: string;
}

interface ThemeData {
    baseColor: string;
    lastUpdated: string;
}

interface ProfileState {
    did: string | null;
    handle: string | null;
    displayName: string | null;
    avatar: string | null;
    bio: string | null;
    theme: ThemeData | null;
    musicServices: MusicServices;
    top8: string[];
    posts: any[];
    isLoading: boolean;
    error: string | null;
}

const state = reactive<ProfileState>({
    did: null,
    handle: null,
    displayName: null,
    avatar: null,
    bio: null,
    theme: null,
    musicServices: {},
    top8: [],
    posts: [],
    isLoading: false,
    error: null,
});

export function useProfile() {
    const auth = useAuth();

    const fetchProfile = async (did?: string) => {
        const agent = auth.getAgent();
        if (!agent) return;

        state.isLoading = true;
        try {
            const targetDid = did || auth.state.session?.did;
            const { data } = await agent.getProfile({
                actor: targetDid,
            });

            state.did = data.did;
            state.handle = data.handle;
            state.displayName = data.displayName;
            state.avatar = data.avatar;
            state.bio = data.description;

            await fetchTheme();
            await fetchMusicServices();
            await fetchTop8();
            await fetchPosts();

            state.error = null;
        } catch (error: any) {
            state.error = error.message;
        } finally {
            state.isLoading = false;
        }
    };

    const fetchTheme = async () => {
        // Implement AT Protocol record fetch for theme
        state.theme = {
            baseColor: "#0000FF", // Default classic blue
            lastUpdated: new Date().toISOString(),
        };
    };

    const fetchMusicServices = async () => {
        // Implement AT Protocol record fetch for music services
        state.musicServices = {
            spotify: "",
            appleMusic: "",
            amazonMusic: "",
        };
    };

    const fetchTop8 = async () => {
        // Implement AT Protocol record fetch for top 8
        state.top8 = [];
    };

    const fetchPosts = async () => {
        const agent = auth.getAgent();
        if (!agent) return;

        try {
            const { data } = await agent.getAuthorFeed({
                actor: state.did!,
                limit: 20,
            });

            state.posts = data.feed
                .filter((post) => post.post.record.text)
                .map((post) => ({
                    date: post.post.indexedAt,
                    content: post.post.record.text,
                    postId: post.post.uri,
                }));
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        }
    };

    const updateTheme = async (baseColor: string) => {
        state.theme = {
            baseColor,
            lastUpdated: new Date().toISOString(),
        };
    };

    const updateMusicServices = async (services: MusicServices) => {
        state.musicServices = services;
    };

    const updateTop8 = async (dids: string[]) => {
        state.top8 = dids;
    };

    return {
        // State (readonly to prevent direct mutations)
        state: readonly(state),

        // Actions
        fetchProfile,
        updateTheme,
        updateMusicServices,
        updateTop8,

        // Computed
        profileData: () => ({
            did: state.did,
            handle: state.handle,
            displayName: state.displayName,
            avatar: state.avatar,
            bio: state.bio,
        }),
        currentTheme: () => state.theme,
        currentMusicServices: () => state.musicServices,
        currentTop8: () => state.top8,
        recentPosts: () => state.posts,
    };
}

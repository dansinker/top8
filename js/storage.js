class StorageManager {
    static saveAuthData(authData, profileData) {
        localStorage.setItem(
            CONFIG.STORAGE_KEYS.AUTH,
            JSON.stringify({
                accessJwt: authData.accessJwt,
                refreshJwt: authData.refreshJwt,
                handle: profileData.bsky_handle,
                profile: profileData,
            }),
        );
    }

    static getStoredAuthData() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH);
        return data ? JSON.parse(data) : null;
    }

    static clearAuthData() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);
    }
}

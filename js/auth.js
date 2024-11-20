// Authentication Manager Class
class AuthManager {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
    }

    async authenticate(username, password) {
        try {
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.CREATE_SESSION}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: username, password }),
                },
            );

            if (!response.ok) throw new Error("Authentication failed");

            const authData = await response.json();
            this.setTokens(authData.accessJwt, authData.refreshJwt);
            return authData;
        } catch (error) {
            console.error("Authentication error:", error);
            throw error;
        }
    }

    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    async refreshSession() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.REFRESH_SESSION}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${this.refreshToken}` },
                },
            );

            if (!response.ok) throw new Error("Refresh failed");

            const refreshData = await response.json();
            this.setTokens(refreshData.accessJwt, refreshData.refreshJwt);
            return refreshData;
        } catch (error) {
            console.error("Session refresh error:", error);
            return false;
        }
    }

    getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
        };
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
    }
}

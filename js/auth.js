// Authentication Manager Class
class AuthManager {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
    }

    async authenticate(username, password) {
        console.debug('[AuthManager] Starting authentication attempt', { username });

        // Input validation
        if (!username || !password) {
            console.error('[AuthManager] Missing credentials');
            throw new Error('Username and password are required');
        }

        // Build request URL and validate
        const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.CREATE_SESSION}`;
        if (!url) {
            console.error('[AuthManager] Invalid API URL configuration');
            throw new Error('Invalid API configuration');
        }

        try {
            console.debug('[AuthManager] Sending authentication request');
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ 
                    identifier: username.trim(), 
                    password 
                }),
            });

            console.debug('[AuthManager] Received response', { 
                status: response.status,
                statusText: response.statusText 
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('[AuthManager] Authentication failed', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody
                });
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }

            const authData = await response.json();

            // Validate response data
            if (!authData?.accessJwt || !authData?.refreshJwt) {
                console.error('[AuthManager] Invalid auth response data', { authData });
                throw new Error('Invalid authentication response');
            }

            console.debug('[AuthManager] Setting tokens');
            this.setTokens(authData.accessJwt, authData.refreshJwt);

            console.debug('[AuthManager] Authentication successful');
            return authData;

        } catch (error) {
            console.error('[AuthManager] Authentication error:', error);
            throw error;
        }
    }

    setTokens(accessToken, refreshToken) {
        console.debug('[AuthManager] Setting authentication tokens');

        // Validate input tokens
        if (!accessToken || typeof accessToken !== 'string') {
            console.error('[AuthManager] Invalid access token provided', { accessToken });
            throw new Error('Invalid access token');
        }

        if (!refreshToken || typeof refreshToken !== 'string') {
            console.error('[AuthManager] Invalid refresh token provided', { refreshToken });
            throw new Error('Invalid refresh token'); 
        }

        // Token format validation (basic JWT structure check)
        const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
        if (!jwtRegex.test(accessToken)) {
            console.error('[AuthManager] Access token fails JWT format validation');
            throw new Error('Invalid access token format');
        }

        if (!jwtRegex.test(refreshToken)) {
            console.error('[AuthManager] Refresh token fails JWT format validation');
            throw new Error('Invalid refresh token format');
        }

        // Store tokens
        try {
            this.accessToken = accessToken.trim();
            this.refreshToken = refreshToken.trim();
            console.debug('[AuthManager] Tokens set successfully', {
                accessTokenLength: this.accessToken.length,
                refreshTokenLength: this.refreshToken.length
            });
        } catch (error) {
            console.error('[AuthManager] Error while setting tokens:', error);
            this.accessToken = null;
            this.refreshToken = null;
            throw error;
        }
    }

    async refreshSession() {
        console.debug('[AuthManager] Starting session refresh');

        // Validate refresh token exists
        if (!this.refreshToken) {
            console.debug('[AuthManager] No refresh token available, aborting refresh');
            return false;
        }

        // Build and validate request URL
        const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.REFRESH_SESSION}`;
        if (!url) {
            console.error('[AuthManager] Invalid refresh URL configuration');
            return false;
        }

        try {
            console.debug('[AuthManager] Sending refresh request');
            const response = await fetch(url, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${this.refreshToken}`,
                    "Accept": "application/json"
                },
            });

            console.debug('[AuthManager] Received refresh response', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('[AuthManager] Refresh failed', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody
                });
                throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
            }

            const refreshData = await response.json();

            // Validate response data
            if (!refreshData?.accessJwt || !refreshData?.refreshJwt) {
                console.error('[AuthManager] Invalid refresh response data', { refreshData });
                throw new Error('Invalid refresh response');
            }

            console.debug('[AuthManager] Setting new tokens from refresh');
            this.setTokens(refreshData.accessJwt, refreshData.refreshJwt);

            console.debug('[AuthManager] Session refresh successful');
            return refreshData;

        } catch (error) {
            console.error('[AuthManager] Session refresh error:', error);
            this.clearTokens(); // Clear invalid tokens
            return false;
        }
    }

    getAuthHeaders(contentType = 'application/json') {
        console.debug('[AuthManager] Generating auth headers');

        // Validate access token exists
        if (!this.accessToken) {
            console.warn('[AuthManager] No access token available for headers');
            throw new Error('No access token available');
        }

        // Validate token format
        const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
        if (!jwtRegex.test(this.accessToken)) {
            console.error('[AuthManager] Access token fails JWT format validation');
            throw new Error('Invalid access token format');
        }

        // Validate content type
        if (typeof contentType !== 'string' || !contentType.trim()) {
            console.warn('[AuthManager] Invalid content type provided, using default');
            contentType = 'application/json';
        }

        const headers = {
            Authorization: `Bearer ${this.accessToken.trim()}`,
            "Content-Type": contentType.trim(),
            "Accept": "application/json"
        };

        console.debug('[AuthManager] Generated auth headers', {
            hasAuth: !!headers.Authorization,
            contentType: headers['Content-Type']
        });

        return headers;
    }

    clearTokens() {
        console.debug('[AuthManager] Clearing authentication tokens');

        try {
            // Store original values for logging
            const hadAccessToken = !!this.accessToken;
            const hadRefreshToken = !!this.refreshToken;

            // Clear both tokens
            this.accessToken = null;
            this.refreshToken = null;

            // Verify tokens were cleared successfully
            if (this.accessToken !== null || this.refreshToken !== null) {
                console.error('[AuthManager] Failed to clear tokens completely');
                throw new Error('Token clearing failed');
            }

            console.debug('[AuthManager] Tokens cleared successfully', {
                previouslyHadAccess: hadAccessToken,
                previouslyHadRefresh: hadRefreshToken,
                currentAccessToken: this.accessToken,
                currentRefreshToken: this.refreshToken
            });

            return true;

        } catch (error) {
            console.error('[AuthManager] Error while clearing tokens:', error);
            // Attempt forceful clear one more time
            this.accessToken = null;
            this.refreshToken = null;
            throw error;
        }
    }
}

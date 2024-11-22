import { CONFIG } from "./config";

export class ProfileManager {
	constructor(authManager) {
		this.authManager = authManager;
		this.profile = null;
	}

	async fetchProfile(handle) {
		console.debug(`[ProfileManager] Fetching profile for handle: ${handle}`);

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
			console.debug(`[ProfileManager] Response status: ${response.status}`);

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

	async fetchProfileByDID(did) {
		console.debug(`[ProfileManager] Fetching profile for DID: ${did}`);

		if (!did) {
			console.error("[ProfileManager] No DID provided");
			throw new Error("DID is required");
		}

		try {
			const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GET_PROFILE}?actor=${encodeURIComponent(did)}`;
			console.debug(`[ProfileManager] Making request to: ${url}`);

			const headers = this.authManager.getAuthHeaders();
			console.debug("[ProfileManager] Request headers:", headers);

			const response = await fetch(url, { headers });
			console.debug(`[ProfileManager] Response status: ${response.status}`);

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
				did,
				error: error.message,
				stack: error.stack,
			});
			throw new Error(
				`Failed to fetch profile for ${did}: ${error.message}`,
			);
		}
	}
}

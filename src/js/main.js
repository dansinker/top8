import { AuthManager } from "./auth";
import { ProfileManager } from "./profile";
import { ThemeManager } from "./theme";
import { StorageManager } from "./storage";

// Main App Class
export class Top8App {
	constructor() {
		this.authManager = new AuthManager();
		this.profileManager = new ProfileManager(this.authManager);
		this.themeManager = new ThemeManager();
	}

	async initialize() {
		console.debug("[Top8App] Initializing application");
		await this.themeManager.initialize();
		await this.restoreSession();
		this.setupEventListeners();
	}

	async restoreSession() {
		console.debug("[Top8App] Restoring session");
		const storedAuth = StorageManager.getStoredAuthData();
		if (storedAuth) {
			this.authManager.setTokens(storedAuth.accessJwt, storedAuth.refreshJwt);
			this.profileManager.profile = storedAuth.profile;
			console.debug("[Top8App] Session restored successfully");
			return true;
		}
		console.debug("[Top8App] No stored session found");
		return false;
	}

	setupEventListeners() {
		console.debug("[Top8App] Setting up event listeners");
		document.addEventListener("DOMContentLoaded", () => {
			this.bindToAlpine();
		});
	}

	bindToAlpine() {
		console.debug("[Top8App] Binding to Alpine.js");
		window.Alpine.data("top8App", () => ({
			person: this.profileManager.profile,
			themeClass: this.themeManager.getThemeClasses(),

			async loginUser(username, password) {
				console.debug("[Top8App] Logging in user", { username });
				try {
					const authData = await this.authManager.authenticate(
						username,
						password,
					);
					const profileData = await this.profileManager.fetchProfile(
						authData.handle,
					);
					StorageManager.saveAuthData(authData, profileData);
					this.person = profileData;
					console.debug("[Top8App] User logged in successfully");
					return true;
				} catch (error) {
					console.error("[Top8App] Login failed:", error);
					return false;
				}
			},

			logout() {
				console.debug("[Top8App] Logging out user");
				this.authManager.clearTokens();
				StorageManager.clearAuthData();
				this.profileManager.profile = null;
				this.person = null;
				console.debug("[Top8App] User logged out successfully");
			},

			async changeTheme(themeName) {
				console.debug("[Top8App] Changing theme", { themeName });
				this.themeClass = await this.themeManager.setTheme(themeName);
			},
		}));
	}
}

// Initialize the application
const app = new Top8App();
app.initialize();

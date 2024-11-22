// Main App Class
export class Top8App {
  constructor() {
    this.authManager = new AuthManager();
    this.profileManager = new ProfileManager(this.authManager);
    this.themeManager = new ThemeManager();
  }

  async initialize() {
    await this.themeManager.initialize();
    await this.restoreSession();
    this.setupEventListeners();
  }

  async restoreSession() {
    const storedAuth = StorageManager.getStoredAuthData();
    if (storedAuth) {
      this.authManager.setTokens(storedAuth.accessJwt, storedAuth.refreshJwt);
      this.profileManager.profile = storedAuth.profile;
      return true;
    }
    return false;
  }

  setupEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      this.bindToAlpine();
    });
  }

  bindToAlpine() {
    window.Alpine.data("top8App", () => ({
      person: this.profileManager.profile,
      themeClass: this.themeManager.getThemeClasses(),

      async loginUser(username, password) {
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
          return true;
        } catch (error) {
          console.error("Login failed:", error);
          return false;
        }
      },

      logout() {
        this.authManager.clearTokens();
        StorageManager.clearAuthData();
        this.profileManager.profile = null;
        this.person = null;
      },

      async changeTheme(themeName) {
        this.themeClass = await this.themeManager.setTheme(themeName);
      },
    }));
  }
}

// Initialize the application
const app = new Top8App();
app.initialize();

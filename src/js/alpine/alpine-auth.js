import { StorageManager } from "../storage";
import { CONFIG } from "../config";

// Authentication component registration
document.addEventListener("alpine:init", () => {
  Alpine.data("appState", () => ({
    person: {},
    username: "",
    password: "",
    loginError: "",
    loading: false,

    async init() {
      await this.checkStoredSession();
    },

    async checkStoredSession() {
      console.debug("[Session] Checking for stored session data");
      try {
        const stored = StorageManager.getStoredAuthData();

        if (stored?.profile) {
          window.managers.authManager.setTokens(
            stored.accessJwt,
            stored.refreshJwt,
          );
          this.person = stored.profile;
          Alpine.store("person", stored.profile);
          Alpine.store("state").setPerson(stored.profile);

          // Initialize theme and update Alpine state
          await window.managers.themeManager.initialize();
          const themeComponent = this.$store.theme;
          if (themeComponent) {
            themeComponent.themeClass =
              window.managers.themeManager.getThemeClasses();
          }
        }
      } catch (error) {
        console.error("[Session] Error checking stored session:", error);
        StorageManager.clearAuthData();
      }
    },

    async loginUser() {
      if (!this.username || !this.password) {
        this.loginError = "Please provide both username and password";
        return;
      }

      this.loading = true;
      this.loginError = "";

      try {
        const authData = await window.managers.authManager.authenticate(
          this.username.trim(),
          this.password,
        );

        const profile = await window.managers.profileManager.fetchProfile(
          authData.handle,
        );

        // Update all relevant stores/states
        this.person = profile;
        Alpine.store("person", profile);
        Alpine.store("state").setPerson(profile);

        // Initialize theme immediately after login
        await window.managers.themeManager.initialize();
        const themeComponent = this.$store.theme;
        if (themeComponent) {
          themeComponent.themeClass =
            window.managers.themeManager.getThemeClasses();
        }

        StorageManager.saveAuthData(authData, profile);

        // Clear sensitive data
        this.password = "";
        this.username = "";
      } catch (error) {
        console.error("[Login] Error during login process:", error);
        this.loginError = error.message || "Login failed";
        this.password = "";
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await window.managers.authManager.clearTokens();
        await StorageManager.clearAuthData();

        this.person = {};
        this.username = "";
        this.password = "";
        this.loginError = "";

        Alpine.store("person", {});
        Alpine.store("state").setPerson({});

        // Reset theme to default
        const defaultTheme = window.managers.themeManager.colorThemes[0];
        document.body.className = defaultTheme;
        window.managers.themeManager.currentTheme = defaultTheme;
        const themeComponent = this.$store.theme;
        if (themeComponent) {
          themeComponent.themeClass =
            window.managers.themeManager.getThemeClasses();
        }
      } catch (error) {
        console.error("[Logout] Error during logout:", error);
        throw new Error("Logout failed: " + error.message);
      }
    },
  }));
});

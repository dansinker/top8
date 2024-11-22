// Import Alpine.js
import Alpine from "alpinejs";

// First import config and core utilities
import "./config";
import "./storage";

// Import managers
import { AuthManager } from "./auth";
import { PDSThemeManager } from "./themePDS";
import { ProfileManager } from "./profile";
import { PostManager } from "./posts";
import { Top8Manager } from "./top8";

// Initialize managers
window.managers = {}; // Create empty object first

// Create AuthManager first since others depend on it
window.managers.authManager = new AuthManager();

// Then create the rest of the managers using the authManager instance
window.managers.profileManager = new ProfileManager(
	window.managers.authManager,
);
window.managers.themeManager = new PDSThemeManager(window.managers.authManager);
window.managers.postsManager = new PostManager();
window.managers.top8Manager = new Top8Manager(window.managers.authManager);

// Now import Alpine components that will use these instances
import "./alpine/alpine-core";
import "./alpine/alpine-auth";
import "./alpine/alpine-theme";
import "./alpine/alpine-posts";
import "./alpine/alpine-top8";

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

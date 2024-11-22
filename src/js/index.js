import Alpine from "alpinejs";
import "./config";
import "./storage";
import { AuthManager } from "./auth";
import { PDSThemeManager } from "./themePDS";
import { ProfileManager } from "./profile";
import { PostManager } from "./posts";
import { Top8Manager } from "./top8";

window.managers = {};

console.debug("[index.js] Initializing AuthManager");
window.managers.authManager = new AuthManager();

console.debug("[index.js] Initializing ProfileManager");
window.managers.profileManager = new ProfileManager(window.managers.authManager);

console.debug("[index.js] Initializing PDSThemeManager");
window.managers.themeManager = new PDSThemeManager(window.managers.authManager);

console.debug("[index.js] Initializing PostManager");
window.managers.postsManager = new PostManager();

console.debug("[index.js] Initializing Top8Manager");
window.managers.top8Manager = new Top8Manager(window.managers.authManager);

import "./alpine/alpine-core";
import "./alpine/alpine-auth";
import "./alpine/alpine-theme";
import "./alpine/alpine-posts";
import "./alpine/alpine-top8";

console.debug("[index.js] Starting Alpine.js");
window.Alpine = Alpine;
Alpine.start();

// Core Alpine.js initialization and store setup
import { AuthManager } from "../auth";
import { ProfileManager } from "../profile";
import { PDSThemeManager } from "../themePDS";
import { PostManager } from "../posts";
import { Top8Manager } from "../top8";

document.addEventListener("alpine:init", () => {
  // Create instances of our managers
  const authManager = new AuthManager();
  const profileManager = new ProfileManager(authManager);
  const themeManager = new PDSThemeManager(authManager);
  const postsManager = new PostManager();
  const top8Manager = new Top8Manager(authManager);

  // Initialize the stores
  Alpine.store("person", {});

  Alpine.store("state", {
    person: {},
    posts: [],
    top8Friends: [],
    setPerson(person) {
      this.person = person;
    },
    setTop8Friends(friends) {
      this.top8Friends = friends;
    },
  });

  // Register the theme store
  Alpine.store("theme", {
    themeClass: themeManager.getThemeClasses(),
  });

  // Make managers available to Alpine components via a store
  Alpine.store("managers", {
    authManager,
    profileManager,
    themeManager,
    postsManager,
    top8Manager,
  });
});

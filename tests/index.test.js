const { AuthManager } = require("../src/js/auth");
const { ProfileManager } = require("../src/js/profile");
const { PDSThemeManager } = require("../src/js/themePDS");
const { PostManager } = require("../src/js/posts");
const { Top8Manager } = require("../src/js/top8");

describe("index.js", () => {
  let authManager;
  let profileManager;
  let themeManager;
  let postsManager;
  let top8Manager;

  beforeAll(() => {
    authManager = new AuthManager();
    profileManager = new ProfileManager(authManager);
    themeManager = new PDSThemeManager(authManager);
    postsManager = new PostManager();
    top8Manager = new Top8Manager(authManager);

    window.managers = {
      authManager,
      profileManager,
      themeManager,
      postsManager,
      top8Manager,
    };
  });

  test("should initialize managers", () => {
    expect(window.managers.authManager).toBeInstanceOf(AuthManager);
    expect(window.managers.profileManager).toBeInstanceOf(ProfileManager);
    expect(window.managers.themeManager).toBeInstanceOf(PDSThemeManager);
    expect(window.managers.postsManager).toBeInstanceOf(PostManager);
    expect(window.managers.top8Manager).toBeInstanceOf(Top8Manager);
  });

  test("should initialize Alpine components", () => {
    document.dispatchEvent(new Event("alpine:init"));
    expect(Alpine.store("managers").authManager).toBeInstanceOf(AuthManager);
    expect(Alpine.store("managers").profileManager).toBeInstanceOf(ProfileManager);
    expect(Alpine.store("managers").themeManager).toBeInstanceOf(PDSThemeManager);
    expect(Alpine.store("managers").postsManager).toBeInstanceOf(PostManager);
    expect(Alpine.store("managers").top8Manager).toBeInstanceOf(Top8Manager);
  });
});

document.addEventListener("alpine:init", () => {
	Alpine.data("theme", () => ({
		colorThemes: [],
		themeClass: {},
		currentTheme: null,

		async init() {
			this.colorThemes = window.managers.themeManager.colorThemes;
			this.themeClass = window.managers.themeManager.getThemeClasses();
			document.body.className = window.managers.themeManager.colorThemes[0];

			const storedPerson = Alpine.store("person");
			if (storedPerson?.bsky_handle) {
				try {
					await window.managers.themeManager.initialize();
					this.themeClass = window.managers.themeManager.getThemeClasses();
				} catch (error) {
					console.error("Failed to initialize theme:", error);
				}
			}

			// Handle theme changes based on route
			this.$watch("$route.path", async (path) => {
				if (path.startsWith("/profile/")) {
					const did = path.split("/profile/")[1];
					if (did) {
						try {
							await window.managers.themeManager.initialize();
							this.themeClass = window.managers.themeManager.getThemeClasses();
						} catch (error) {
							console.error("Failed to initialize theme for profile:", error);
						}
					}
				}
			});
		},

		validateTheme(themeName) {
			return window.managers.themeManager.validateTheme(themeName);
		},

		choiceClass(themeName) {
			return window.managers.themeManager.choiceClass(themeName);
		},

		async changeTheme(themeName) {
			try {
				const result = await window.managers.themeManager.setTheme(themeName);
				this.themeClass = result;
			} catch (error) {
				console.error("Failed to change theme:", error);
			}
		},
	}));
});

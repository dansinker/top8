// Posts component registration
document.addEventListener("alpine:init", () => {
	Alpine.data("posts", () => ({
		blogs: [],
		loading: true,
		error: null,
		lastHandle: null, // Track last processed handle to prevent duplicate loads

		init() {
			console.debug("[Posts Component] Initializing posts component");
			this.loadInitialPosts();
			this.setupWatcher();
		},

		async loadInitialPosts() {
			console.debug("[Posts Component] Checking for initial person data");
			const person = Alpine.store("state").person;
			if (person?.bsky_handle) {
				console.debug(
					"[Posts Component] Found initial person data, loading posts",
				);
				await this.loadPostsForHandle(person.bsky_handle);
			}
		},

		setupWatcher() {
			console.debug("[Posts Component] Setting up person store watcher");
			this.$watch("$store.person", async (person) => {
				if (!person) {
					console.debug(
						"[Posts Component] Person data cleared, resetting state",
					);
					this.resetState();
					return;
				}

				if (!person.bsky_handle) {
					console.warn("[Posts Component] Person missing bsky_handle");
					this.error = "Invalid user profile - missing Bluesky handle";
					return;
				}

				if (person.bsky_handle === this.lastHandle) {
					console.debug(
						"[Posts Component] Skipping duplicate load for handle:",
						person.bsky_handle,
					);
					return;
				}

				await this.loadPostsForHandle(person.bsky_handle);
			});
		},

		async loadPostsForHandle(handle) {
			console.debug("[Posts Component] Loading posts for handle:", handle);
			this.loading = true;
			this.error = null;

			try {
				const state = await window.managers.postsManager.loadPosts(handle);

				console.debug("[Posts Component] Posts loaded:", {
					postCount: state.blogs?.length || 0,
					loading: state.loading,
					error: state.error,
				});

				this.blogs = state.blogs || [];
				this.loading = state.loading;
				this.error = state.error;
				this.lastHandle = handle;
			} catch (error) {
				console.error("[Posts Component] Error loading posts:", error);
				this.error = `Failed to load posts: ${error.message}`;
				this.blogs = [];
			} finally {
				this.loading = false;
			}
		},

		resetState() {
			this.blogs = [];
			this.loading = false;
			this.error = null;
			this.lastHandle = null;
		},
	}));
});

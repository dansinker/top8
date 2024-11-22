document.addEventListener("alpine:init", () => {
	Alpine.data("top8", () => ({
		friends: [],
		searchQuery: "",
		searchResults: [],
		selectedFriends: [],
		showDialog: false,
		showAllFriendsModal: false,
		allFriends: [],
		loading: false,
		error: null,

		async init() {
			console.debug("[Top8 Component] Initializing top8 component");
			if (this.$store.person?.bsky_handle) {
				await this.loadFriends();
			}

			// Watch for person changes to reload friends
			this.$watch("$store.person", async (person) => {
				if (person?.bsky_handle) {
					await this.loadFriends();
				} else {
					this.friends = [];
				}
			});

			// Handle route changes to load friends based on route
			this.$watch("$route.path", async (path) => {
				console.debug("[Top8 Component] Route changed:", path);
				if (path.startsWith("/profile/")) {
					const did = path.split("/profile/")[1];
					if (did) {
						await this.loadFriendsForDid(did);
					}
				}
			});
		},

		async loadFriends() {
			try {
				console.debug("[Top8 Component] Loading friends for current user");
				this.loading = true;
				this.error = null;
				const friends = await window.managers.top8Manager.initialize();
				this.friends = friends;
				this.selectedFriends = [...friends]; // Copy current friends to selected
				Alpine.store("state").setTop8Friends(friends);
				console.debug("[Top8 Component] Friends loaded successfully");
			} catch (error) {
				console.error("[Top8 Component] Failed to load friends:", error);
				this.error = `Failed to load friends: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		async loadFriendsForDid(did) {
			try {
				console.debug("[Top8 Component] Loading friends for DID:", did);
				this.loading = true;
				this.error = null;
				const friends = await window.managers.top8Manager.loadFriendsForDid(did);
				this.friends = friends;
				this.selectedFriends = [...friends]; // Copy current friends to selected
				Alpine.store("state").setTop8Friends(friends);
				console.debug("[Top8 Component] Friends loaded for DID successfully");
			} catch (error) {
				console.error("[Top8 Component] Failed to load friends for DID:", error);
				this.error = `Failed to load friends for DID: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		async searchFriends() {
			if (!this.searchQuery.trim()) {
				this.searchResults = [];
				return;
			}

			try {
				console.debug("[Top8 Component] Searching friends with query:", this.searchQuery);
				this.loading = true;
				this.error = null;
				this.searchResults = await window.managers.top8Manager.searchFollows(
					this.searchQuery,
				);
				console.debug("[Top8 Component] Search results:", this.searchResults);
			} catch (error) {
				console.error("[Top8 Component] Search failed:", error);
				this.error = `Search failed: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		toggleFriend(friend) {
			const index = this.selectedFriends.findIndex((f) => f.did === friend.did);
			if (index === -1) {
				if (this.selectedFriends.length >= 8) {
					this.error = "Maximum 8 friends allowed";
					console.warn("[Top8 Component] Maximum 8 friends allowed");
					return;
				}
				this.selectedFriends.push(friend);
				console.debug("[Top8 Component] Friend added:", friend);
			} else {
				this.selectedFriends.splice(index, 1);
				console.debug("[Top8 Component] Friend removed:", friend);
			}
		},

		isFriendSelected(friend) {
			return this.selectedFriends.some((f) => f.did === friend.did);
		},

		async saveFriends() {
			try {
				console.debug("[Top8 Component] Saving selected friends");
				this.loading = true;
				this.error = null;
				await window.managers.top8Manager.saveFriends(this.selectedFriends);
				this.friends = [...this.selectedFriends];
				Alpine.store("state").setTop8Friends(this.friends);
				this.showDialog = false;
				console.debug("[Top8 Component] Friends saved successfully");
			} catch (error) {
				console.error("[Top8 Component] Failed to save friends:", error);
				this.error = `Failed to save friends: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		async fetchAllFriends() {
			try {
				console.debug("[Top8 Component] Fetching all friends");
				this.loading = true;
				this.error = null;
				this.allFriends = await window.managers.top8Manager.loadAllFollows();
				console.debug("[Top8 Component] All friends fetched successfully");
			} catch (error) {
				console.error("[Top8 Component] Failed to fetch all friends:", error);
				this.error = `Failed to fetch all friends: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		closeAllFriendsModal() {
			this.showAllFriendsModal = false;
			console.debug("[Top8 Component] All friends modal closed");
		},
	}));
});

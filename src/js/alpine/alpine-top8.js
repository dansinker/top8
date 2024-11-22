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
		},

		async loadFriends() {
			try {
				this.loading = true;
				this.error = null;
				const friends = await window.managers.top8Manager.initialize();
				this.friends = friends;
				this.selectedFriends = [...friends]; // Copy current friends to selected
				Alpine.store("state").setTop8Friends(friends);
			} catch (error) {
				console.error("Failed to load friends:", error);
				this.error = `Failed to load friends: ${error.message}`;
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
				this.loading = true;
				this.error = null;
				this.searchResults = await window.managers.top8Manager.searchFollows(
					this.searchQuery,
				);
			} catch (error) {
				console.error("Search failed:", error);
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
					return;
				}
				this.selectedFriends.push(friend);
			} else {
				this.selectedFriends.splice(index, 1);
			}
		},

		isFriendSelected(friend) {
			return this.selectedFriends.some((f) => f.did === friend.did);
		},

		async saveFriends() {
			try {
				this.loading = true;
				this.error = null;
				await window.managers.top8Manager.saveFriends(this.selectedFriends);
				this.friends = [...this.selectedFriends];
				Alpine.store("state").setTop8Friends(this.friends);
				this.showDialog = false;
			} catch (error) {
				console.error("Failed to save friends:", error);
				this.error = `Failed to save friends: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		async fetchAllFriends() {
			try {
				this.loading = true;
				this.error = null;
				this.allFriends = await window.managers.top8Manager.loadAllFollows();
			} catch (error) {
				console.error("Failed to fetch all friends:", error);
				this.error = `Failed to fetch all friends: ${error.message}`;
			} finally {
				this.loading = false;
			}
		},

		closeAllFriendsModal() {
			this.showAllFriendsModal = false;
		},
	}));
});

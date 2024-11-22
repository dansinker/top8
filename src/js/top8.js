import { PDSRecordManager } from "./pds";
import { CONFIG } from "./config";

export class Top8Manager {
	constructor(authManager) {
		if (!authManager) {
			throw new Error("[Top8Manager] AuthManager is required");
		}
		this.pds = new PDSRecordManager(authManager);

		// Use config values
		this.recordType = CONFIG.TOP8.RECORD_TYPE;
		this.recordKey = CONFIG.TOP8.RECORD_KEY;

		this.listName = CONFIG.TOP8.LIST_NAME;
		this.listDescription = CONFIG.TOP8.LIST_NAME;
		this.listPurpose = CONFIG.TOP8.LIST_PURPOSE;

		// Add cache for follows
		this.followsCache = null;
		this.lastCacheUpdate = null;
		this.cacheExpiration = CONFIG.TOP8.CACHE_DURATION;

		// Store list URI after creation
		this.listUri = null;
	}

	async initialize() {
		console.debug("[Top8Manager] Starting initialization...");

		try {
			// First, ensure the list exists
			const list = await this.getOrCreateList();
			this.listUri = `at://${this.pds.authManager.did}/${this.recordType}/${this.recordKey}`;

			// Then get all list items
			const items = await this.getListItems();

			// Process and return the items
			return this.processListItems(items);
		} catch (error) {
			console.error("[Top8Manager] Initialization error:", error);
			throw error;
		}
	}

	async getOrCreateList() {
		try {
			// Try to get existing list
			const existingList = await this.pds.getRecord(
				this.recordType,
				this.recordKey,
			);

			if (existingList) {
				console.debug("[Top8Manager] Found existing list:", existingList);
				return existingList;
			}

			// Create new list if none exists
			const newList = {
				name: this.listName,
				purpose: this.listPurpose,
				description: this.listDescription,
				createdAt: new Date().toISOString(),
				$type: this.recordType,
			};

			const result = await this.pds.putRecord(
				this.recordType,
				this.recordKey,
				newList,
			);

			console.debug("[Top8Manager] Created new list:", result);
			return { ...newList, uri: result.uri };
		} catch (error) {
			console.error("[Top8Manager] Error in getOrCreateList:", error);
			throw error;
		}
	}

	async getListItems() {
		try {
			const query = {
				collection: "app.bsky.graph.listitem",
				repo: this.pds.authManager.did,
				limit: CONFIG.TOP8.MAX_FRIENDS,
			};

			const response = await fetch(
				`${CONFIG.API.BASE_URL}/com.atproto.repo.listRecords?${new URLSearchParams(
					{
						collection: query.collection,
						repo: query.repo,
						limit: query.limit.toString(),
					},
				)}`,
				{
					headers: await this.pds.getAuthHeadersWithRefresh(),
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch list items: ${response.status}`);
			}

			const data = await response.json();
			return data.records || [];
		} catch (error) {
			console.error("[Top8Manager] Error fetching list items:", error);
			return [];
		}
	}

	processListItems(items) {
		return items.map((item, index) => ({
			did: item.value.subject,
			position: index,
			uniqueId: `${item.value.subject}-${Date.now()}-${index}`,
			handle: item.value.handle,
			displayName: item.value.displayName,
			avatar: item.value.avatar,
		}));
	}

	async loadAllFollows() {
		console.debug("[Top8Manager] Loading all follows...");
		const follows = [];
		let cursor = null;

		try {
			do {
				const url = new URL(
					`${CONFIG.API.PUBLIC_URL}/app.bsky.graph.getFollows`,
				);
				url.searchParams.append("actor", this.pds.authManager.did);
				url.searchParams.append("limit", "100");
				if (cursor) {
					url.searchParams.append("cursor", cursor);
				}

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				follows.push(...(data.follows || []));
				cursor = data.cursor;

				console.debug(
					`[Top8Manager] Loaded ${follows.length} follows so far...`,
				);
			} while (cursor);

			// Format follows for consistent structure
			this.followsCache = follows.map((follow) => ({
				did: follow.did,
				handle: follow.handle,
				displayName: follow.displayName || follow.handle,
				avatar: follow.avatar,
			}));

			this.lastCacheUpdate = Date.now();
			console.debug(
				`[Top8Manager] Cached ${this.followsCache.length} total follows`,
			);

			return this.followsCache;
		} catch (error) {
			console.error("[Top8Manager] Error loading all follows:", error);
			throw error;
		}
	}

	isCacheValid() {
		return (
			this.followsCache &&
			this.lastCacheUpdate &&
			Date.now() - this.lastCacheUpdate < this.cacheExpiration
		);
	}

	async searchFollows(query) {
		console.debug("[Top8Manager] Searching follows:", query);

		try {
			if (!this.isCacheValid()) {
				await this.loadAllFollows();
			}

			const searchQuery = query.toLowerCase();

			// Add unique IDs to search results
			const results = this.followsCache
				.filter(
					(follow) =>
						follow.handle.toLowerCase().includes(searchQuery) ||
						follow.displayName?.toLowerCase().includes(searchQuery),
				)
				.map((follow, index) => ({
					...follow,
					uniqueId: `${follow.did}-${Date.now()}-${index}`,
				}));

			console.debug(
				`[Top8Manager] Found ${results.length} matches for "${query}"`,
			);
			return results;
		} catch (error) {
			console.error("[Top8Manager] Error searching follows:", error);
			throw error;
		}
	}

	async saveFriends(friends) {
		if (!Array.isArray(friends) || friends.length > CONFIG.TOP8.MAX_FRIENDS) {
			throw new Error(`Maximum ${CONFIG.TOP8.MAX_FRIENDS} friends allowed`);
		}

		try {
			// Ensure list exists and get URI
			await this.getOrCreateList();
			const listUri = `at://${this.pds.authManager.did}/${this.recordType}/${this.recordKey}`;
			this.listUri = listUri;

			// Delete existing items
			await this.deleteExistingItems();

			// Create new items
			return await Promise.all(
				friends.map((friend, index) => this.createListItem(friend, index)),
			);
		} catch (error) {
			console.error("[Top8Manager] Error saving friends:", error);
			throw error;
		}
	}

	async deleteExistingItems() {
		try {
			const existingItems = await this.getListItems();
			await Promise.all(
				existingItems.map((item) =>
					this.pds.deleteRecord("app.bsky.graph.listitem", item.rkey),
				),
			);
		} catch (error) {
			console.error("[Top8Manager] Error deleting items:", error);
			throw error;
		}
	}

	async createListItem(friend, index) {
		if (!friend.did || !this.listUri) {
			throw new Error("Invalid friend data or list URI not set");
		}

		const record = {
			list: this.listUri,
			subject: friend.did,
			createdAt: new Date().toISOString(),
			$type: "app.bsky.graph.listitem",
		};

		const rkey = `${this.recordKey}_${index}`;
		return this.pds.putRecord("app.bsky.graph.listitem", rkey, record);
	}

	clearCache() {
		this.followsCache = null;
		this.lastCacheUpdate = null;
	}
}

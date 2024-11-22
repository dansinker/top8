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

		// Add cache for follows
		this.followsCache = null;
		this.lastCacheUpdate = null;
		this.cacheExpiration = CONFIG.TOP8.CACHE_DURATION;
	}

	async initialize() {
		console.debug("[Top8Manager] Starting initialization...", {
			recordType: this.recordType,
			recordKey: this.recordKey,
		});

		// Input validation
		if (!this.recordType || !this.recordKey) {
			console.error("[Top8Manager] Missing required configuration");
			throw new Error("Invalid record type or key configuration");
		}

		let record;
		try {
			console.debug("[Top8Manager] Attempting to fetch existing record...");
			record = await this.pds.getRecord(this.recordType, this.recordKey);
			console.debug(
				"[Top8Manager] Fetch result:",
				record ? "Found existing record" : "No record found",
			);
		} catch (fetchError) {
			console.error("[Top8Manager] Error fetching record:", {
				error: fetchError,
				stack: fetchError.stack,
			});
			throw new Error("Failed to fetch Top 8 record", { cause: fetchError });
		}

		// If no record exists, create it
		if (!record) {
			console.debug(
				"[Top8Manager] No existing record found, initiating creation...",
			);
			try {
				record = await this.createTop8();
				console.debug("[Top8Manager] Successfully created new record:", {
					recordId: record?.uri,
					itemCount: record?.items?.length,
				});
			} catch (createError) {
				console.error("[Top8Manager] Failed to create initial record:", {
					error: createError,
					stack: createError.stack,
				});
				return []; // Return empty array to allow app to continue
			}
		}

		// Validate record structure
		if (!record || typeof record !== "object") {
			console.error("[Top8Manager] Invalid record structure:", record);
			return [];
		}

		// Extract and validate items array
		const items = record.items;
		if (!Array.isArray(items)) {
			console.warn("[Top8Manager] Record items is not an array:", items);
			return [];
		}

		console.debug("[Top8Manager] Processing friends list...", {
			friendCount: items.length,
		});

		// Add unique identifiers to each friend with validation
		const processedFriends = items
			.map((friend, index) => {
				if (!friend || !friend.did) {
					console.warn("[Top8Manager] Invalid friend entry at index", index);
					return null;
				}

				const timestamp = Date.now();
				const uniqueId = `${friend.did}-${timestamp}-${index}`;

				console.debug("[Top8Manager] Processed friend:", {
					index,
					did: friend.did,
					uniqueId,
				});

				return {
					...friend,
					uniqueId,
					position: index,
				};
			})
			.filter(Boolean); // Remove any null entries

		console.debug("[Top8Manager] Initialization complete", {
			totalFriends: processedFriends.length,
		});

		return processedFriends;
	}

	async createTop8(
		customName = "My Top 8 Friends",
		customDescription = "My closest friends on Bluesky",
	) {
		const startTime = Date.now();
		console.debug("[Top8Manager] Beginning Top 8 record creation process...", {
			recordType: this.recordType,
			recordKey: this.recordKey,
			customName,
			customDescription,
			timestamp: new Date().toISOString(),
		});

		// Input validation with detailed error messages
		if (!this.recordType) {
			const error = new Error("Record type is required but was not provided");
			console.error("[Top8Manager] Record type validation failed:", {
				providedType: this.recordType,
				error,
			});
			throw error;
		}

		if (!this.recordKey) {
			const error = new Error("Record key is required but was not provided");
			console.error("[Top8Manager] Record key validation failed:", {
				providedKey: this.recordKey,
				error,
			});
			throw error;
		}

		// Sanitize and validate string inputs
		const sanitizedName = (customName || "").trim();
		const sanitizedDescription = (customDescription || "").trim();

		console.debug("[Top8Manager] Sanitized inputs:", {
			originalName: customName,
			sanitizedName,
			originalDescription: customDescription,
			sanitizedDescription,
		});

		// Enhanced default record with additional metadata
		const defaultRecord = {
			purpose: CONFIG.TOP8.LIST_PURPOSE || "top8",
			name: sanitizedName || "My Top 8 Friends",
			description: sanitizedDescription || "My closest friends on Bluesky",
			items: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: "1.0",
			$type: this.recordType,
			metadata: {
				creator: this.pds?.authManager?.did,
				createTimestamp: Date.now(),
				schemaVersion: "1.0.0",
				clientInfo: {
					userAgent:
						typeof window !== "undefined"
							? window.navigator.userAgent
							: "server",
					platform:
						typeof window !== "undefined"
							? window.navigator.platform
							: "server",
				},
			},
		};

		console.debug("[Top8Manager] Constructed record with metadata:", {
			record: defaultRecord,
			validation: {
				hasRequiredFields: Boolean(defaultRecord.purpose && defaultRecord.name),
				itemsLength: defaultRecord.items.length,
				timestampsValid: Boolean(
					Date.parse(defaultRecord.createdAt) &&
						Date.parse(defaultRecord.updatedAt),
				),
			},
		});

		try {
			// Enhanced PDS connection validation
			if (!this.pds) {
				throw new Error("PDS connection not initialized");
			}

			if (!this.pds.authManager) {
				throw new Error("PDS auth manager not initialized");
			}

			if (!this.pds.authManager.did) {
				throw new Error("No DID available in auth manager");
			}

			console.debug("[Top8Manager] PDS connection validated", {
				pdsInitialized: Boolean(this.pds),
				authManagerInitialized: Boolean(this.pds.authManager),
				did: this.pds.authManager.did,
			});

			console.debug("[Top8Manager] Initiating record creation in PDS...");

			// Create record with timeout handling
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(
					() => reject(new Error("PDS record creation timed out")),
					10000,
				);
			});

			const result = await Promise.race([
				this.pds.putRecord(this.recordType, this.recordKey, defaultRecord),
				timeoutPromise,
			]);

			// Enhanced result validation
			if (!result) {
				throw new Error("No result received from PDS");
			}

			if (!result.uri || !result.cid) {
				throw new Error("Invalid PDS response format - missing uri or cid");
			}

			const duration = Date.now() - startTime;
			console.debug("[Top8Manager] Successfully created Top 8 record:", {
				uri: result.uri,
				cid: result.cid,
				record: defaultRecord,
				processingTimeMs: duration,
				timestamp: new Date().toISOString(),
			});

			// Return enhanced record
			return {
				...defaultRecord,
				uri: result.uri,
				cid: result.cid,
				metadata: {
					...defaultRecord.metadata,
					processingTimeMs: duration,
				},
			};
		} catch (error) {
			const duration = Date.now() - startTime;
			console.error("[Top8Manager] Critical error creating Top 8 record:", {
				error,
				errorName: error.name,
				errorMessage: error.message,
				stackTrace: error.stack,
				recordType: this.recordType,
				recordKey: this.recordKey,
				processingTimeMs: duration,
				timestamp: new Date().toISOString(),
			});

			// Enhanced error wrapping with detailed context
			throw new Error(
				`Failed to create Top 8 record (${duration}ms): ${error.message}`,
				{
					cause: error,
					context: {
						recordType: this.recordType,
						recordKey: this.recordKey,
						processingTimeMs: duration,
					},
				},
			);
		}
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
		console.debug("[Top8Manager] Saving friends:", friends);

		if (!Array.isArray(friends) || friends.length > CONFIG.TOP8.MAX_FRIENDS) {
			throw new Error(
				`Invalid friends list - maximum ${CONFIG.TOP8.MAX_FRIENDS} friends allowed`,
			);
		}

		try {
			const record = {
				purpose: CONFIG.TOP8.LIST_PURPOSE,
				name: "My Top 8 Friends",
				description: "My closest friends on Bluesky",
				items: friends.map((friend, index) => ({
					subject: friend.did,
					handle: friend.handle,
					displayName: friend.displayName,
					avatar: friend.avatar,
					position: index,
					uniqueId: friend.uniqueId || `${friend.did}-${Date.now()}-${index}`,
				})),
				createdAt: new Date().toISOString(),
				$type: this.recordType,
			};

			await this.pds.putRecord(this.recordType, this.recordKey, record);
			return true;
		} catch (error) {
			console.error("[Top8Manager] Error saving friends:", error);
			throw error;
		}
	}

	clearCache() {
		this.followsCache = null;
		this.lastCacheUpdate = null;
	}
}

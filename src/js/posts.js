import { CONFIG } from "./config";

// Post Manager Class
export class PostManager {
	constructor() {
		// Initialize empty state
		this.state = {
			blogs: [],
			loading: true,
			error: null,
		};
	}

	// Format posts data
	formatPosts(feed, handle) {
		const logPrefix = "[PostManager::formatPosts]";
		console.debug(`${logPrefix} Starting format, input:`, {
			feedLength: feed?.length || 0,
			handle,
			feedType: typeof feed,
		});

		// Validate inputs
		if (!handle || typeof handle !== "string") {
			console.warn(`${logPrefix} Invalid handle provided:`, handle);
			return [];
		}

		if (!Array.isArray(feed)) {
			console.warn(`${logPrefix} Invalid feed provided:`, feed);
			return [];
		}

		try {
			console.debug(`${logPrefix} Starting post filtering`);
			const filteredPosts = feed.filter((item) => {
				// Deep validation of item structure
				if (!item?.post?.record || !item.post?.author) {
					console.warn(`${logPrefix} Invalid post structure:`, {
						hasPost: !!item?.post,
						hasRecord: !!item?.post?.record,
						hasAuthor: !!item?.post?.author,
					});
					return false;
				}

				const post = item.post;
				console.debug(`${logPrefix} Processing post:`, {
					uri: post.uri,
					author: post.author.handle,
					isReply: !!post.record.reply,
					isRepost: !!post.record.repost,
				});

				// Enhanced filtering logic
				const isOriginalPost =
					!post.record.reply &&
					!post.record.repost &&
					post.author.handle === handle &&
					post.record.text?.trim().length > 0; // Ensure non-empty posts

				console.debug(`${logPrefix} Post filtering result:`, {
					uri: post.uri,
					isOriginalPost,
					matchesHandle: post.author.handle === handle,
				});

				return isOriginalPost;
			});

			console.debug(
				`${logPrefix} Filtered ${feed.length} -> ${filteredPosts.length} posts`,
			);

			// Use slice instead of splice to avoid mutating original array
			const limitedPosts = filteredPosts.slice(0, 12);
			console.debug(`${logPrefix} Limited to ${limitedPosts.length} posts`);

			return limitedPosts
				.map((item, index) => {
					const post = item.post;
					const author = post.author || {};

					try {
						const formattedPost = {
							text: post.record.text?.trim() || "",
							createdAt: this.validateDate(post.record.createdAt),
							author: {
								name:
									this.sanitizeString(author.displayName) ||
									author.handle ||
									"Unknown",
								handle: author.handle || "unknown",
								url: author.handle
									? `https://bsky.app/profile/${encodeURIComponent(author.handle)}`
									: "#",
							},
							uri: post.uri || "",
							id: post.cid || `temp-${index}`, // Added unique ID
						};

						console.debug(
							`${logPrefix} Formatted post ${index + 1}/${limitedPosts.length}:`,
							formattedPost,
						);
						return formattedPost;
					} catch (formatError) {
						console.error(
							`${logPrefix} Error formatting individual post:`,
							formatError,
						);
						return null;
					}
				})
				.filter(Boolean); // Remove any null entries from failed formatting
		} catch (error) {
			console.error(`${logPrefix} Fatal error formatting posts:`, error);
			return [];
		}
	}

	// Helper method to validate dates
	validateDate(dateString) {
		try {
			const date = new Date(dateString);
			return date.toISOString();
		} catch {
			return new Date().toISOString();
		}
	}

	// Helper method to sanitize strings
	sanitizeString(str) {
		if (!str) return "";
		return String(str).trim().slice(0, 500); // Reasonable length limit
	}

	// Fetch posts for a user
	async loadPosts(handle, limit = 64, retryAttempts = 3) {
		console.debug(
			"[PostManager] Loading posts for handle:",
			handle,
			"limit:",
			limit,
		);

		// Validate handle
		if (!handle || typeof handle !== "string") {
			console.warn("[PostManager] Invalid handle provided:", handle);
			this.state.loading = false;
			this.state.error = "Invalid handle";
			return this.state;
		}

		this.state.loading = true;
		this.state.error = null;
		this.state.blogs = [];

		let attempts = 0;
		while (attempts < retryAttempts) {
			try {
				console.debug(
					`[PostManager] Fetch attempt ${attempts + 1}/${retryAttempts}`,
				);

				const url = `${CONFIG.API.PUBLIC_URL}${CONFIG.API.ENDPOINTS.GET_AUTHOR_FEED}?actor=${encodeURIComponent(handle)}&limit=${limit}`;
				console.debug("[PostManager] Fetching from URL:", url);

				const response = await fetch(url, {
					method: "GET",
					headers: {
						Accept: "application/json",
					},
					timeout: 5000,
				});

				console.debug("[PostManager] Response status:", response.status);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				console.debug("[PostManager] Received data:", data);

				if (!data || !Array.isArray(data.feed)) {
					throw new Error("Invalid response format");
				}

				this.state.blogs = this.formatPosts(data.feed, handle);
				console.debug(
					"[PostManager] Successfully loaded posts, count:",
					this.state.blogs.length,
				);
				break;
			} catch (err) {
				attempts++;
				console.error(
					`[PostManager] Error loading posts (attempt ${attempts}/${retryAttempts}):`,
					err,
				);

				if (attempts === retryAttempts) {
					this.state.error = `Failed to load posts: ${err.message}`;
					this.state.blogs = [];
				} else {
					// Wait before retry with exponential backoff
					await new Promise((resolve) =>
						setTimeout(resolve, Math.pow(2, attempts) * 1000),
					);
					continue;
				}
			}
		}

		this.state.loading = false;
		console.debug(
			"[PostManager] Final state:",
			JSON.stringify(this.state, null, 2),
		);
		return this.state;
	}
}

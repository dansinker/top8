class PDSRecordManager {
    constructor(authManager) {
        if (!authManager) {
            throw new Error("[PDSRecordManager] AuthManager is required");
        } else {
            console.debug("[PDSRecordManager] AuthManager found");
        }
        this.authManager = authManager;
        this.baseUrl = CONFIG.API.BASE_URL;
    }

    async putRecord(collection, rkey, record) {
        console.debug("[PDSRecordManager] Attempting to put record", {
            collection,
            rkey,
            recordSize: JSON.stringify(record).length,
        });

        // Validate required parameters
        if (!collection || typeof collection !== "string") {
            throw new Error("Invalid collection parameter");
        }
        if (!rkey || typeof rkey !== "string") {
            throw new Error("Invalid rkey parameter");
        }
        if (!record || typeof record !== "object") {
            throw new Error("Invalid record parameter");
        }

        // Check authentication
        if (!this.authManager?.did) {
            console.error("[PDSRecordManager] Authentication missing");
            throw new Error("Authentication required");
        }

        try {
            // Get auth headers and validate
            const headers = this.authManager.getAuthHeaders();
            if (!headers || !headers.authorization) {
                throw new Error("Invalid auth headers");
            }

            console.debug("[PDSRecordManager] Sending request with headers", {
                headerKeys: Object.keys(headers),
            });

            // Prepare request body
            const requestBody = {
                repo: this.authManager.did,
                collection,
                rkey,
                record: {
                    ...record,
                    createdAt: new Date().toISOString(),
                    $type: collection,
                    lastModified: new Date().toISOString(), // Added tracking
                },
            };

            console.debug("[PDSRecordManager] Request payload", requestBody);

            // Make request with timeout
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(
                `${this.baseUrl}/com.atproto.repo.putRecord`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                },
            );

            clearTimeout(timeout);

            console.debug("[PDSRecordManager] Response received", {
                status: response.status,
                ok: response.ok,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("[PDSRecordManager] Error response", {
                    status: response.status,
                    body: errorBody,
                });
                throw new Error(
                    `Failed to save record: ${response.status} - ${errorBody}`,
                );
            }

            const responseData = await response.json();
            console.debug("[PDSRecordManager] Record saved successfully", {
                responseData,
            });

            return responseData;
        } catch (error) {
            console.error(
                `[PDSRecordManager] Save record error for ${collection}:`,
                error,
                {
                    stack: error.stack,
                    cause: error.cause,
                },
            );
            throw error;
        }
    }

    async getRecord(collection, rkey) {
        console.debug("[PDSRecordManager] Attempting to get record", {
            collection,
            rkey,
        });

        // Validate required parameters
        if (!collection || typeof collection !== "string") {
            console.error("[PDSRecordManager] Invalid collection parameter");
            throw new Error("Invalid collection parameter");
        }
        if (!rkey || typeof rkey !== "string") {
            console.error("[PDSRecordManager] Invalid rkey parameter");
            throw new Error("Invalid rkey parameter");
        }

        // Check authentication
        if (!this.authManager?.did) {
            console.error("[PDSRecordManager] Authentication missing");
            throw new Error("Authentication required");
        }

        try {
            // Get auth headers and validate
            const headers = this.authManager.getAuthHeaders();
            if (!headers || !headers.authorization) {
                console.error("[PDSRecordManager] Invalid auth headers");
                throw new Error("Invalid auth headers");
            }

            console.debug("[PDSRecordManager] Sending request with headers", {
                headerKeys: Object.keys(headers),
            });

            // Make request with timeout
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const url = new URL(`${this.baseUrl}/com.atproto.repo.getRecord`);
            url.searchParams.append("repo", this.authManager.did);
            url.searchParams.append("collection", collection);
            url.searchParams.append("rkey", rkey);

            const response = await fetch(url, {
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            console.debug("[PDSRecordManager] Response received", {
                status: response.status,
                ok: response.ok,
            });

            if (response.status === 404) {
                console.debug("[PDSRecordManager] Record not found");
                return null;
            }

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("[PDSRecordManager] Error response", {
                    status: response.status,
                    body: errorBody,
                });
                throw new Error(
                    `Failed to get record: ${response.status} - ${errorBody}`,
                );
            }

            const data = await response.json();
            console.debug("[PDSRecordManager] Record retrieved successfully", {
                dataKeys: Object.keys(data),
            });

            return data.value;
        } catch (error) {
            console.error(
                `[PDSRecordManager] Get record error for ${collection}:`,
                error,
                {
                    stack: error.stack,
                    cause: error.cause,
                },
            );

            if (error.name === "AbortError") {
                throw new Error("Request timed out");
            }

            return null;
        }
    }

    async listRecords(collection, limit = 100, cursor = null) {
        console.debug("[PDSRecordManager] Attempting to list records", {
            collection,
            limit,
            cursor,
        });

        // Validate required parameters
        if (!collection || typeof collection !== "string") {
            console.error("[PDSRecordManager] Invalid collection parameter");
            throw new Error("Invalid collection parameter");
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
            console.error("[PDSRecordManager] Invalid limit parameter");
            throw new Error(
                "Invalid limit parameter - must be integer between 1-1000",
            );
        }

        // Check authentication
        if (!this.authManager?.did) {
            console.error("[PDSRecordManager] Authentication missing");
            throw new Error("Authentication required");
        }

        try {
            // Get auth headers and validate
            const headers = this.authManager.getAuthHeaders();
            if (!headers || !headers.authorization) {
                console.error("[PDSRecordManager] Invalid auth headers");
                throw new Error("Invalid auth headers");
            }

            console.debug("[PDSRecordManager] Sending request with headers", {
                headerKeys: Object.keys(headers),
            });

            // Build URL with params
            const url = new URL(`${this.baseUrl}/com.atproto.repo.listRecords`);
            url.searchParams.append("repo", this.authManager.did);
            url.searchParams.append("collection", collection);
            url.searchParams.append("limit", limit.toString());
            if (cursor) {
                url.searchParams.append("cursor", cursor);
            }

            // Make request with timeout
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(url, {
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            console.debug("[PDSRecordManager] Response received", {
                status: response.status,
                ok: response.ok,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("[PDSRecordManager] Error response", {
                    status: response.status,
                    body: errorBody,
                });
                throw new Error(
                    `Failed to list records: ${response.status} - ${errorBody}`,
                );
            }

            const data = await response.json();
            console.debug("[PDSRecordManager] Records retrieved successfully", {
                recordCount: data.records?.length,
                cursor: data.cursor,
            });

            return data.records || [];
        } catch (error) {
            console.error(
                `[PDSRecordManager] List records error for ${collection}:`,
                error,
                {
                    stack: error.stack,
                    cause: error.cause,
                },
            );

            if (error.name === "AbortError") {
                throw new Error("Request timed out");
            }

            return [];
        }
    }

    async deleteRecord(collection, rkey) {
        console.debug("[PDSRecordManager] Attempting to delete record", {
            collection,
            rkey,
        });

        // Validate required parameters
        if (!collection || typeof collection !== "string") {
            console.error("[PDSRecordManager] Invalid collection parameter");
            throw new Error("Invalid collection parameter");
        }
        if (!rkey || typeof rkey !== "string") {
            console.error("[PDSRecordManager] Invalid rkey parameter");
            throw new Error("Invalid rkey parameter");
        }

        // Check authentication
        if (!this.authManager?.did) {
            console.error("[PDSRecordManager] Authentication missing");
            throw new Error("Authentication required");
        }

        try {
            // Get auth headers and validate
            const headers = this.authManager.getAuthHeaders();
            if (!headers || !headers.authorization) {
                console.error("[PDSRecordManager] Invalid auth headers");
                throw new Error("Invalid auth headers");
            }

            console.debug(
                "[PDSRecordManager] Sending delete request with headers",
                {
                    headerKeys: Object.keys(headers),
                },
            );

            // Make request with timeout
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const requestBody = {
                repo: this.authManager.did,
                collection,
                rkey,
            };

            console.debug(
                "[PDSRecordManager] Delete request payload",
                requestBody,
            );

            const response = await fetch(
                `${this.baseUrl}/com.atproto.repo.deleteRecord`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                },
            );

            clearTimeout(timeout);

            console.debug("[PDSRecordManager] Delete response received", {
                status: response.status,
                ok: response.ok,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("[PDSRecordManager] Delete error response", {
                    status: response.status,
                    body: errorBody,
                });
                throw new Error(
                    `Failed to delete record: ${response.status} - ${errorBody}`,
                );
            }

            console.debug("[PDSRecordManager] Record deleted successfully");
            return true;
        } catch (error) {
            console.error(
                `[PDSRecordManager] Delete record error for ${collection}:`,
                error,
                {
                    stack: error.stack,
                    cause: error.cause,
                },
            );

            if (error.name === "AbortError") {
                throw new Error("Delete request timed out");
            }

            throw error;
        }
    }
}

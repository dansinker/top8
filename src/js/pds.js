import { CONFIG } from "./config";

export class PDSRecordManager {
  constructor(authManager) {
    if (!authManager) {
      throw new Error("[PDSRecordManager] AuthManager is required");
    }
    this.authManager = authManager;
    this.baseUrl = CONFIG.API.BASE_URL;
  }

  // Helper method to handle auth headers with refresh
  async getAuthHeadersWithRefresh() {
    try {
      // First try getting regular headers
      const headers = this.authManager.getAuthHeaders();
      return headers;
    } catch (error) {
      console.debug(
        "[PDSRecordManager] Initial auth headers failed, attempting refresh",
      );

      // Attempt to refresh the session
      const refreshResult = await this.authManager.refreshSession();
      if (!refreshResult) {
        throw new Error("Failed to refresh authentication");
      }

      // Try getting headers again after refresh
      return this.authManager.getAuthHeaders();
    }
  }

  async putRecord(collection, rkey, record) {
    console.debug("[PDSRecordManager] Attempting to put record", {
      collection,
      rkey,
      recordSize: JSON.stringify(record).length,
    });

    // Validate params first
    if (!collection || !rkey || !record) {
      throw new Error("Missing required parameters");
    }

    try {
      // Get auth headers with potential refresh
      const headers = await this.getAuthHeadersWithRefresh();

      if (!headers?.Authorization) {
        throw new Error("No valid authorization header");
      }

      // Prepare request body
      const requestBody = {
        repo: this.authManager.did,
        collection,
        rkey,
        record: {
          ...record,
          $type: collection,
          createdAt: new Date().toISOString(),
        },
      };

      const response = await fetch(
        `${this.baseUrl}/com.atproto.repo.putRecord`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[PDSRecordManager] Put record error:", error);
      throw error;
    }
  }

  async getRecord(collection, rkey) {
    console.debug("[PDSRecordManager] Attempting to get record", {
      collection,
      rkey,
    });

    if (!collection || !rkey) {
      throw new Error("Missing required parameters");
    }

    try {
      // Get auth headers with potential refresh
      const headers = await this.getAuthHeadersWithRefresh();

      if (!headers?.Authorization) {
        throw new Error("No valid authorization header");
      }

      const url = new URL(`${this.baseUrl}/com.atproto.repo.getRecord`);
      url.searchParams.append("repo", this.authManager.did);
      url.searchParams.append("collection", collection);
      url.searchParams.append("rkey", rkey);

      const response = await fetch(url, {
        headers: headers,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error("[PDSRecordManager] Get record error:", error);
      throw error;
    }
  }
}

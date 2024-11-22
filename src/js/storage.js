import { CONFIG } from "./config";

export class StorageManager {
  static saveAuthData(authData, profileData) {
    console.debug("[StorageManager] Attempting to save auth data...", {
      hasAuthData: !!authData,
      hasProfileData: !!profileData,
    });

    // Validate required inputs
    if (!authData || !profileData) {
      console.error("[StorageManager] Missing required auth or profile data");
      throw new Error("Missing required auth or profile data");
    }

    // Validate required auth properties
    const requiredAuthProps = ["accessJwt", "refreshJwt"];
    const missingAuthProps = requiredAuthProps.filter(
      (prop) => !authData[prop],
    );
    if (missingAuthProps.length) {
      console.error(
        "[StorageManager] Missing required auth properties:",
        missingAuthProps,
      );
      throw new Error(
        `Missing required auth properties: ${missingAuthProps.join(", ")}`,
      );
    }

    try {
      // Prepare storage data
      const storageData = {
        accessJwt: authData.accessJwt,
        refreshJwt: authData.refreshJwt,
        handle: profileData.bsky_handle,
        profile: profileData,
        lastUpdated: new Date().toISOString(),
      };

      console.debug("[StorageManager] Saving auth data to storage...", {
        handle: storageData.handle,
        lastUpdated: storageData.lastUpdated,
      });

      // Attempt to store data
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.AUTH,
        JSON.stringify(storageData),
      );

      console.debug("[StorageManager] Auth data saved successfully");
    } catch (error) {
      console.error("[StorageManager] Failed to save auth data:", error);
      throw new Error("Failed to save authentication data to storage");
    }
  }

  static getStoredAuthData() {
    console.debug(
      "[StorageManager] Attempting to retrieve stored auth data...",
    );

    try {
      // Attempt to get data from storage
      const rawData = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH);

      console.debug("[StorageManager] Raw auth data retrieved:", {
        exists: !!rawData,
      });

      if (!rawData) {
        console.debug("[StorageManager] No stored auth data found");
        return null;
      }

      // Attempt to parse the data
      const parsedData = JSON.parse(rawData);

      // Validate required fields
      const requiredFields = [
        "accessJwt",
        "refreshJwt",
        "handle",
        "profile",
        "lastUpdated",
      ];
      const missingFields = requiredFields.filter(
        (field) => !parsedData[field],
      );

      if (missingFields.length) {
        console.warn(
          "[StorageManager] Stored auth data is missing required fields:",
          missingFields,
        );
        return null;
      }

      console.debug(
        "[StorageManager] Successfully retrieved and validated auth data",
        {
          handle: parsedData.handle,
          lastUpdated: parsedData.lastUpdated,
        },
      );

      return parsedData;
    } catch (error) {
      console.error(
        "[StorageManager] Error retrieving stored auth data:",
        error,
      );
      return null;
    }
  }

  static clearAuthData() {
    console.debug("[StorageManager] Attempting to clear auth data...");

    try {
      // Check if auth data exists before clearing
      const existingData = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH);

      console.debug("[StorageManager] Current auth data state:", {
        exists: !!existingData,
        storageKey: CONFIG.STORAGE_KEYS.AUTH,
      });

      // Attempt to remove the data
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);

      // Verify removal was successful
      const remainingData = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH);
      if (remainingData) {
        console.error(
          "[StorageManager] Failed to clear auth data - data still exists",
        );
        throw new Error("Failed to clear authentication data from storage");
      }

      console.debug("[StorageManager] Auth data cleared successfully");
    } catch (error) {
      console.error("[StorageManager] Error clearing auth data:", error);
      throw new Error("Failed to clear authentication data from storage");
    }
  }
}

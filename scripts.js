// function initPerson(self, person, username) {
//   if (!username) {
//       // If username is null, don't do anything
//       return;
//   }

//   // This grabs the user's profile from Bluesky's public API
//   fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`)
//       .then(response => {
//           if (!response.ok) {
//               alert(`Something went wrong: ${response.status} - ${response.statusText}`);
//               return null;
//           }
//           return response.json();
//       })
//       .then(data => {
//           if (!data) {
//               console.error("No data returned from Bluesky API.");
//               return;
//           }

//           // Update the person object that was passed to the function
//           person.name = data.displayName || username;
//           person.bsky_handle = data.handle;
//           person.bsky_url = `https://bsky.app/profile/${data.handle}`;
//           person.bsky_did = data.did;
//           person.avatar = data.avatar;
//           person.note = data.description;

//           // Define the URL that will be fetched for the user's posts
//           const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${person.bsky_handle}&limit=6`;

//           // Write the URL to the console log
//           console.log(url);

//           // Call the fetch method of the fetchPosts component to fetch the posts data and display it in the #postbox element
//           fetchPosts.fetch(url);
//       })
//       .catch(error => console.error('Error fetching Bluesky profile:', error));
// }

// // this grabs the posts

// function initPerson(self, person, username) {
//   if (!username) {
//       // If username is null, don't do anything
//       return;
//   }

//   // This grabs the user's profile from Bluesky's public API
//   fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`)
//       .then(response => {
//           if (!response.ok) {
//               alert(`Something went wrong: ${response.status} - ${response.statusText}`);
//               return null;
//           }
//           return response.json();
//       })
//       .then(data => {
//           if (!data) {
//               console.error("No data returned from Bluesky API.");
//               return;
//           }

//           // Update the person object that was passed to the function
//           person.name = data.displayName || username;
//           person.bsky_handle = data.handle;
//           person.bsky_url = `https://bsky.app/profile/${data.handle}`;
//           person.bsky_did = data.did;
//           person.avatar = data.avatar;
//           person.note = data.description;

//           // Define the URL that will be fetched for the user's posts
//           const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${person.bsky_handle}&limit=6`;

//           // Write the URL to the console log
//           console.log(url);

//           // Call the fetch method of the fetchPosts component to fetch the posts data and display it in the #postbox element
//           fetchPosts.fetch(url);
//       })
//       .catch(error => console.error('Error fetching Bluesky profile:', error));
// }

// this grabs the posts
// moved to the index page which seems very dumb but was working so

// Authentication and profile initialization
// Authentication and profile initialization
async function initPerson(self, person, username, password) {
    if (!username) {
        return;
    }

    try {
        // First authenticate with Bluesky
        const authResponse = await fetch(
            "https://bsky.social/xrpc/com.atproto.server.createSession",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: username,
                    password: password,
                }),
            },
        );

        if (!authResponse.ok) {
            throw new Error("Authentication failed");
        }

        const authData = await authResponse.json();

        // Store auth data
        person.accessJwt = authData.accessJwt;
        person.refreshJwt = authData.refreshJwt;

        // Get full profile with authentication
        const profileResponse = await fetch(
            `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${authData.handle}`,
            {
                headers: {
                    Authorization: `Bearer ${authData.accessJwt}`,
                },
            },
        );

        if (!profileResponse.ok) {
            throw new Error("Failed to fetch profile");
        }

        const data = await profileResponse.json();

        // Update the person object with profile data
        person.name = data.displayName || username;
        person.bsky_handle = data.handle;
        person.bsky_url = `https://bsky.app/profile/${data.handle}`;
        person.bsky_did = data.did;
        person.avatar = data.avatar;
        person.note = data.description;

        // Store auth status
        person.isAuthenticated = true;

        // Save tokens in localStorage for persistence
        localStorage.setItem(
            "bluesky_auth",
            JSON.stringify({
                accessJwt: authData.accessJwt,
                refreshJwt: authData.refreshJwt,
                handle: data.handle,
                // Store additional profile data for immediate restoration
                profile: {
                    name: person.name,
                    avatar: person.avatar,
                    note: person.note,
                    bsky_url: person.bsky_url,
                    bsky_did: person.bsky_did,
                },
            }),
        );

        return true;
    } catch (error) {
        console.error("Error during authentication:", error);
        alert("Login failed. Please check your credentials and try again.");
        return false;
    }
}

// Function to check if we have a stored session and restore it
function checkStoredSession(person) {
    const storedAuth = localStorage.getItem("bluesky_auth");
    if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        return initPersonWithToken(
            person,
            authData.handle,
            authData.accessJwt,
            authData.profile,
        );
    }
    return Promise.resolve(false);
}

// Initialize person using stored token
async function initPersonWithToken(
    person,
    handle,
    token,
    storedProfile = null,
) {
    try {
        const profileResponse = await fetch(
            `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${handle}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!profileResponse.ok) {
            // Token might be expired - try to refresh
            const refreshResult = await refreshSession(person);
            if (!refreshResult) {
                localStorage.removeItem("bluesky_auth");
                return false;
            }
            return true;
        }

        const data = await profileResponse.json();

        // Update person object
        person.name = data.displayName || handle;
        person.bsky_handle = data.handle;
        person.bsky_url = `https://bsky.app/profile/${data.handle}`;
        person.bsky_did = data.did;
        person.avatar = data.avatar;
        person.note = data.description;
        person.isAuthenticated = true;
        person.accessJwt = token;

        return true;
    } catch (error) {
        console.error("Error restoring session:", error);

        if (storedProfile) {
            // If API call fails but we have stored profile data, use it temporarily
            Object.assign(person, storedProfile);
            person.isAuthenticated = true;
            person.accessJwt = token;
            return true;
        }

        localStorage.removeItem("bluesky_auth");
        return false;
    }
}

// Add a refresh token function
async function refreshSession(person) {
    const storedAuth = localStorage.getItem("bluesky_auth");
    if (!storedAuth) return false;

    const { refreshJwt } = JSON.parse(storedAuth);
    if (!refreshJwt) return false;

    try {
        const refreshResponse = await fetch(
            "https://bsky.social/xrpc/com.atproto.server.refreshSession",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refreshJwt}`,
                },
            },
        );

        if (!refreshResponse.ok) {
            throw new Error("Refresh failed");
        }

        const refreshData = await refreshResponse.json();

        // Update stored auth data with new tokens
        const storedData = JSON.parse(storedAuth);
        storedData.accessJwt = refreshData.accessJwt;
        storedData.refreshJwt = refreshData.refreshJwt;
        localStorage.setItem("bluesky_auth", JSON.stringify(storedData));

        // Update person object
        person.accessJwt = refreshData.accessJwt;
        return true;
    } catch (error) {
        console.error("Error refreshing session:", error);
        return false;
    }
}

// Update the logout function
function logout(person) {
    // Clear stored session
    localStorage.removeItem("bluesky_auth");

    // Reset person object
    Object.keys(person).forEach((key) => delete person[key]);
}

// this deals with friends stuff, though a lot of that is in the actual index file, stupidly.

const updateFriends = () => {
    // split the friendsInput string into an array of friends
    const friends = $data.friendsInput.split(",");
    // set the value of the friends array to the friends array
    $data.$set({ friends });
    // reset the friendsInput variable to an empty string
    $data.$set({ friendsInput: "" });
};

// this is the theme function

function theme() {
    return {
        colorThemes: [
            "pink", // #f7e8a4
            "dark-blue", // #172A3A
            "almond", // #d9c5b2
            "vampire", // #04A777
            "toxic",
            "shoes",
            "angels",
            "night",
            "pastel",
        ],
        themeClass: {},
        choiceClass(className) {
            const classes = { "color-choice": true };
            classes[className] = true;
            return classes;
        },
        changeTheme(className) {
            this.themeClass = this.colorThemes.reduce((allClasses, cn) => {
                allClasses[cn] = className === cn;
                return allClasses;
            }, {});
        },
    };
}

// Add this to your existing window.onload or document.addEventListener('DOMContentLoaded')
document.addEventListener("DOMContentLoaded", function () {
    const wholething = document.getElementById("wholething").__x.$data;

    // Check for stored session
    checkStoredSession(wholething.person).then((success) => {
        if (success) {
            console.log("Session restored");
        }
    });
});

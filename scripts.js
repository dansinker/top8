function initPerson(self, person, username) {
  if (!username) {
      // If username is null, don't do anything
      return;
  }

  // This grabs the user's profile from Bluesky's public API
  fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`)
      .then(response => {
          if (!response.ok) {
              alert(`Something went wrong: ${response.status} - ${response.statusText}`);
              return null;
          }
          return response.json();
      })
      .then(data => {
          if (!data) {
              console.error("No data returned from Bluesky API.");
              return;
          }

          // Update the person object that was passed to the function
          person.name = data.displayName || username;
          person.bsky_handle = data.handle;
          person.bsky_url = `https://bsky.app/profile/${data.handle}`;
          person.bsky_did = data.did;
          person.avatar = data.avatar;
          person.note = data.description;

          // Define the URL that will be fetched for the user's posts
          const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${person.bsky_handle}&limit=6`;

          // Write the URL to the console log
          console.log(url);

          // Call the fetch method of the fetchPosts component to fetch the posts data and display it in the #postbox element
          fetchPosts.fetch(url);
      })
      .catch(error => console.error('Error fetching Bluesky profile:', error));
}

// this grabs the posts

function initPerson(self, person, username) {
  if (!username) {
      // If username is null, don't do anything
      return;
  }

  // This grabs the user's profile from Bluesky's public API
  fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`)
      .then(response => {
          if (!response.ok) {
              alert(`Something went wrong: ${response.status} - ${response.statusText}`);
              return null;
          }
          return response.json();
      })
      .then(data => {
          if (!data) {
              console.error("No data returned from Bluesky API.");
              return;
          }

          // Update the person object that was passed to the function
          person.name = data.displayName || username;
          person.bsky_handle = data.handle;
          person.bsky_url = `https://bsky.app/profile/${data.handle}`;
          person.bsky_did = data.did;
          person.avatar = data.avatar;
          person.note = data.description;

          // Define the URL that will be fetched for the user's posts
          const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${person.bsky_handle}&limit=6`;

          // Write the URL to the console log
          console.log(url);

          // Call the fetch method of the fetchPosts component to fetch the posts data and display it in the #postbox element
          fetchPosts.fetch(url);
      })
      .catch(error => console.error('Error fetching Bluesky profile:', error));
}

// this grabs the posts

const fetchPosts = {
  blogs: [],

  // Define a method for fetching the posts data
  fetch(url, targetCount = 6) {
      if (!url) {
          // If url is null, don't do anything
          return;
      }

      const fetchPostsRecursively = async (fetchUrl, collectedPosts = []) => {
          try {
              const response = await fetch(fetchUrl);
              if (!response.ok) {
                  alert(`Something went wrong: ${response.status} - ${response.statusText}`);
                  return collectedPosts;
              }

              const data = await response.json();

              if (data && data.feed) {
                  // Filter out replies
                  const originalPosts = data.feed
                      .filter(item => !item.post.record.reply)
                      .map(item => ({
                          text: item.post.record.text, // Post content
                          createdAt: item.post.record.createdAt, // Timestamp
                          author: {
                              name: item.post.author.displayName || item.post.author.handle,
                              handle: item.post.author.handle,
                              avatar: item.post.author.avatar,
                              url: `https://bsky.app/profile/${item.post.author.handle}`,
                          },
                          uri: item.post.uri, // Post URI
                      }));

                  // Add new original posts to collected posts
                  collectedPosts = [...collectedPosts, ...originalPosts];

                  // Check if we have enough posts
                  if (collectedPosts.length >= targetCount) {
                      return collectedPosts.slice(0, targetCount); // Limit to target count
                  }

                  // Fetch more posts if there's a cursor for pagination
                  if (data.cursor) {
                      const nextUrl = `${fetchUrl}&cursor=${data.cursor}`;
                      return fetchPostsRecursively(nextUrl, collectedPosts);
                  }
              }

              return collectedPosts; // Return collected posts if no more data
          } catch (error) {
              console.error('Error fetching Bluesky posts:', error);
              return collectedPosts;
          }
      };

      fetchPostsRecursively(url).then(posts => {
          this.blogs = posts;
          console.log(this.blogs);
      });
  },
};



// this deals with friends stuff, though a lot of that is in the actual index file, stupidly.

const updateFriends = () => {
  // split the friendsInput string into an array of friends
  const friends = $data.friendsInput.split(',');
  // set the value of the friends array to the friends array
  $data.$set({ friends });
  // reset the friendsInput variable to an empty string
  $data.$set({ friendsInput: '' });
};

// this is the theme function

function theme() {
  return {
      colorThemes: [
          'pink', // #f7e8a4
          'dark-blue', // #172A3A
          'almond', // #d9c5b2
          'vampire', // #04A777
          'toxic',
          'shoes',
          'angels',
          'night',
          'pastel',
      ],
      themeClass: {},
      choiceClass(className) {
          const classes = { 'color-choice': true };
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

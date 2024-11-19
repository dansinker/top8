function initPerson(self, person, username) {
    if (!username) {
      // If username is null, don't do anything
      return;
    }

    // this grabs the user, it is configured to run search through my mastodon server //
  
    fetch(`https://omfg.town/api/v2/search?q=${username}`)
      .then(response => {
        if (!response.ok) {
          alert(`Something went wrong: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Update the person object that was passed to the function
        person.name = data.accounts[0].display_name;
        person.mast_address = data.accounts[0].acct;
        person.mast_url = data.accounts[0].url;
        person.mast_id = data.accounts[0].id;
        person.avatar = data.accounts[0].avatar;
        person.note = data.accounts[0].note;
  
        // Define the URL that will be fetched
        const url = `https://omfg.town/api/v1/accounts/${person.mast_id}/statuses?exclude_reblogs=true&exclude_replies=true&limit=6`;
  
        // Write the URL to the console log
        console.log(url);
  
        // Call the fetch method of the fetchPosts component to fetch the posts data and display it in the #postbox element
        fetchPosts.fetch(url);
      });
  }
  
  const fetchPosts = {
    blogs: [],
  
    // Define a method for fetching the posts data
    fetch(url) {
      if (!url) {
        // If url is null, don't do anything
        return;
      }
  
      // Use the url parameter in the fetch request
      fetch(url)
        .then(response => {
          if (!response.ok) {
            alert(`Something went wrong: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        // set data to blogs
        .then(data => this.blogs = data)
        // Log the blogs array to the console
        .then((data) => console.log(this.blogs));
    },
  };

  const updateFriends = () => {
    // split the friendsInput string into an array of friends
    const friends = $data.friendsInput.split(',');
    // set the value of the friends array to the friends array
    $data.$set({ friends });
    // reset the friendsInput variable to an empty string
    $data.$set({ friendsInput: '' });
  };

function theme() {
    return {
        colorThemes: [
            'pink', //#f7e8a4
            'dark-blue', // #172A3A
            'almond', // #d9c5b2
            'vampire', // #04A777
            'toxic',
            'shoes',
            'angels',
            'night',
            'pastel'
        ],
        themeClass: {},
        choiceClass(className) {
            const classes = {'color-choice': true};
            classes[className] = true;
            return classes;
        },
        changeTheme(className) {
            this.themeClass = this.colorThemes.reduce((allClasses, cn) => {
                allClasses[cn] = className === cn;
                return allClasses;
            }, {});
        }
    }
};

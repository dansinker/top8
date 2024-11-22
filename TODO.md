# TODO List for Top8.space

## Authentication
- [x] Implement login flow using Bluesky App Password.
- [ ] Add guidance for creating a Bluesky App Password.
- [ ] Encrypt session data before storing in Local Storage.
- [x] Implement logout functionality with session termination.
- [ ] Set up rate limiting for login attempts.
- [x] Create error messaging for authentication failures.
- [ ] Handle automatic session expiration after token timeout.

## Profile Management
- [x] Fetch and display profile data (Display name, Handle, Avatar, etc.).
- [ ] Implement editing for tagline, music links, theme preference, and Top 8 friends list.
- [ ] Store custom profile fields (e.g., tagline, theme) in AT Protocol records.
- [ ] Fetch other users' profiles by DID for public viewing.

## Top 8 Friends Management
- [x] Create friend selection interface with search functionality.
- [ ] Implement drag-and-drop or arrow-based ordering for the list.
- [x] Save and update Top 8 list in AT Protocol record.

## Theme System
- [x] Design and implement 12 predefined base colors.
- [ ] Develop automatic theme generation logic (complementary, contrast, accents).
- [x] Create CSS for theme styling.
- [x] Add theme selection UI.

## Music Integration
- [ ] Add form fields for Spotify, Apple Music, and Amazon Music URLs.
- [ ] Validate and store music URLs in AT Protocol record.
- [ ] Display music profile links as icons on the user profile.

## Content Creation & Display
- [ ] Fetch and display Bluesky blog posts in classic MySpace style.
- [ ] Implement "Share to Bulletin" functionality (Bluesky reposts).
- [ ] Build post creation interface with a simple text area.
- [ ] Integrate AT Protocol post creation API.
- [ ] Add character count for posts.

## UI Layout
- [ ] Build fixed-width layout with two-column design.
- [ ] Implement table-based layout for authenticity.
- [ ] Create left-column profile display.
- [ ] Create right-column sections for "About Me," blog posts, Top 8 grid, and comments.
- [ ] Style sections with classic MySpace design (e.g., borders, bold headers, simple hover states).

## Technical Architecture
- [ ] Set up Parcel for development and production builds.
- [ ] Organize project file structure.
- [ ] Create modular JavaScript files for each feature (auth.js, profile.js, etc.).
- [ ] Implement Alpine.js for reactive components.
- [ ] Build static HTML and CSS components.

## AT Protocol Integration
- [ ] Create and manage AT Protocol records:
  - [ ] Theme record.
  - [ ] Music integration record.
  - [ ] Top 8 list record.
  - [ ] Post display interface.
- [ ] Query Bluesky API for profile and post data.
- [ ] Handle error cases for AT Protocol requests.

## Security
- [ ] Securely handle Bluesky credentials.
- [ ] Validate all user inputs (e.g., music URLs, posts).
- [ ] Implement XSS prevention measures.
- [ ] Ensure secure interaction with AT Protocol.
- [ ] Comply with CORS policies.

## Performance
- [ ] Optimize AT Protocol queries.
- [ ] Implement local caching for frequently used data.
- [ ] Minimize dependency usage and reduce bundle size.
- [ ] Optimize asset loading.

## Testing
- [ ] Unit test all major components (authentication, profile management, etc.).
- [ ] Integration test for AT Protocol queries and data handling.
- [ ] Browser compatibility testing.
- [ ] Test for performance and loading times.

## Deployment
- [ ] Set up hosting (e.g., GitHub Pages, Netlify, Vercel).
- [ ] Configure production build process.
- [ ] Test static deployment on chosen hosting platform.

## Future Considerations
- [ ] Allow for advanced theme customization.
- [ ] Add more profile customization options.
- [ ] Integrate additional social features (e.g., comments, messaging).
- [ ] Provide analytics for profile views and interactions.
- [ ] Explore options for performance and feature enhancements.

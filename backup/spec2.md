# Top8.space Specification Document

## Overview

Top8.space is a static web application that reimagines the classic 2006-era MySpace experience using the Bluesky/AT Protocol ecosystem. Users can create and manage their "Top 8 Friends" list, customize their profiles with classic MySpace-style themes, and interact with other users while maintaining all data through AT Protocol records.

## Core Features

### 1. Authentication

-   Traditional username/password authentication flow
    -   Users input their Bluesky identifier (email or handle) and password
    -   Strong recommendation for users to use Bluesky App Password instead of main account password
    -   Clear guidance provided on how to create an App Password in Bluesky
-   Authentication state management:
    -   Session data stored in local storage:
        -   Access token
        -   User DID
        -   Handle
        -   Basic profile information
    -   All session data is encrypted before storage
    -   No refresh token implementation (requires re-authentication when token expires)
-   Logout functionality:
    -   Complete session termination on logout
    -   Clearing of all stored authentication data
    -   Immediate redirect to login page
-   Security considerations:
    -   Implementation of rate limiting for login attempts
    -   Clear error messaging for authentication failures
    -   No password storage or caching
    -   Automatic session expiration after token timeout

### 2. Profile Management

-   Users can view and edit their profiles
-   Profile components:
    -   Display name (read from Bluesky)
    -   Handle (read from Bluesky)
    -   Avatar (read from Bluesky)
    -   Custom tagline (stored in AT Protocol record)
    -   Music integration links (stored in AT Protocol record)
    -   Theme preference (stored in AT Protocol record)
    -   Top 8 friends list (stored in AT Protocol record)
-   Profile data is fetched using AT Protocol endpoints
-   Other users' profiles can be viewed by DID

### 3. Top 8 Friends Management

-   Users can select and order their top 8 friends
-   Features:
    -   Friend selection interface
    -   Simple numbered list (1-8) with up/down arrows
    -   Basic search functionality for finding friends
    -   Save/update functionality
-   Data storage:
    -   List is stored as an AT Protocol record
    -   Order preservation in the record
    -   Record type: "top8space" list

### 4. Theme System

-   Simplified color-based theme generation
    -   Users select from 12 predefined base colors:
        1. Classic Blue (#0000FF)
        2. Forest Green (#228B22)
        3. Ruby Red (#E0115F)
        4. Royal Purple (#7851A9)
        5. Sunset Orange (#FD5E53)
        6. Ocean Teal (#469990)
        7. Lavender (#E6E6FA)
        8. Rose Gold (#B76E79)
        9. Midnight Blue (#191970)
        10. Emerald (#50C878)
        11. Burgundy (#800020)
        12. Golden (#FFD700)
-   Automatic theme generation:
    -   System automatically generates a complete theme based on selected color:
        -   Primary color (selected base color)
        -   Secondary color (computed complementary color)
        -   Background color (computed lighter/darker variants)
        -   Text colors (computed for optimal contrast)
        -   Border colors (computed from base color)
        -   Accent elements (computed for highlights and interactive elements)

### 5. Music Integration

-   Simple URL storage and display
    -   Support for:
        -   Spotify profile URL
        -   Apple Music profile URL
        -   Amazon Music profile URL
    -   Basic URL validation (format checking only)
    -   Display as simple linked icons
-   No external API integration or profile data fetching

### 6. Content Creation & Display

-   Blog Posts (Bluesky Integration)

    -   Classic MySpace blog post styling
        -   Bold post date header
        -   Simple text content
        -   "Share to Bulletin" link (implements Bluesky repost)
    -   Only show original text posts (no quotes or reposts)
    -   Chronological order (newest first)
    -   No threaded replies or comments
    -   No rich media embedding

-   Post Creation (for logged-in user on their own profile):
    -   Classic "Blog" entry interface
        -   Simple text area
        -   Basic "Post" button
        -   Character count (matching Bluesky limits)
    -   Posts are created directly on Bluesky
    -   No draft saving
    -   No media upload support

## User Interface Layout

### Classic MySpace-Style Layout

-   Fixed-width layout (800px) centered on page
-   Two-column design:
    -   Left column (narrow, ~300px):
        -   Profile section at top
            -   Profile image (default square format)
            -   Display name
            -   "Last Login" (from Bluesky last post date)
            -   Location/Basic Info
        -   "View My: [Photos] [Bluesky]" links
        -   "Contact" section
            -   Music profile links (displayed as classic "Add to Friends" style buttons)
        -   Mood/Status section
            -   Current tagline display
    -   Right column (wide, ~500px):
        -   "About Me" section at top
            -   User's Bluesky bio
        -   Blog/Posts section
            -   Recent Bluesky posts displayed in classic blog format
        -   "Top 8" section
            -   2x4 grid of friend profiles
            -   Each friend displayed in square format with:
                -   Profile picture
                -   Display name
                -   Small "View Profile" link
        -   Comments section (implemented as Bluesky replies)

### Classic Styling Elements

-   Heavy use of table-based layouts (for authenticity)
-   Classic elements:
    -   Table borders and backgrounds
    -   Bold section headers with dark backgrounds
    -   "1.0" era web typography:
        -   Arial/Helvetica for general text
        -   Default system fonts
        -   No custom web fonts
    -   Classic blue links (unless themed)
    -   Minimal rounded corners
    -   No modern shadows or animations
    -   Simple hover states
    -   Basic borders around sections

## Technical Stack

### Core Technologies

-   HTML5 (using classic table-based layouts)
-   Alpine.js v3.x
    -   Used for minimal reactivity
    -   Perfect for simple state management
    -   No virtual DOM overhead
-   Vanilla JavaScript (ES6+ modules)
    -   Organized by feature (auth.js, profile.js, etc.)
    -   No framework dependencies
-   CSS3
    -   Minimal use of modern features
    -   Focus on table-based layouts
    -   Simple selectors
-   Parcel (v2)
    -   Zero configuration bundling
    -   Development server
    -   Production builds

### Key Dependencies

-   `@atproto/api` - AT Protocol client library
-   `nuxt` - Minimal reactive framework
-   No other major dependencies required

### Development Environment

-   `npm` for package management
-   No complex build steps
-   No transpilation beyond basic browser support

### State Management

-   Alpine.js for reactive state
-   Local Storage for persistence
-   No complex state management libraries needed

Example Alpine.js Component Structure:

```html
<div x-data="profile">
    <div class="profile-section">
        <table>
            <tr>
                <td class="header" x-text="userData.name"></td>
            </tr>
            <tr>
                <td class="content">
                    <div x-html="userData.bio"></div>
                </td>
            </tr>
        </table>
    </div>
</div>

<script>
    document.addEventListener("alpine:init", () => {
        Alpine.data("profile", () => ({
            userData: {
                name: "",
                bio: "",
            },
            async init() {
                // Load profile data
                const data = await loadProfile();
                this.userData = data;
            },
        }));
    });
</script>
```

### Build Process

```bash
# Development
npm run dev    # runs parcel serve

# Production
npm run build  # runs parcel build
```

### Deployment

-   Output is completely static
-   Can be served from any static hosting:
    -   GitHub Pages
    -   Netlify
    -   Vercel
    -   Any basic HTTP server

## Technical Architecture

### File Structure

```
/
├── index.html
├── css/
│   ├── styles.css
│   └── themes/
│       └── theme-templates.css
├── js/
│   ├── main.js
│   ├── auth.js
│   ├── profile.js
│   ├── top8.js
│   ├── theme.js
│   └── posts.js
└── assets/
    └── images/
        └── icons/
```

### AT Protocol Records

#### Records Schema

1. Theme Record:

```typescript
interface ThemeRecord {
    baseColor: string; // Hex code from predefined list
    lastUpdated: string;
}
```

2. Music Integration Record:

```typescript
interface MusicIntegrationRecord {
    services: {
        spotify?: string;
        appleMusic?: string;
        amazonMusic?: string;
    };
    lastUpdated: string;
}
```

3. Top 8 List Record:

```typescript
interface Top8List {
    $type: "app.bsky.graph.list";
    name: "Top 8";
    purpose: "Top 8 Friends List";
    description?: string;
    createdAt: string;
}
```

4. Post Display Interface:

```typescript
interface PostDisplay {
    date: string;
    content: string;
    postId: string; // Bluesky post identifier
    canShare: boolean; // based on logged-in user status
}
```

## Implementation Requirements

### Static Application Requirements

-   No server-side processing
-   All data stored in AT Protocol records
-   Client-side rendering only
-   Local storage for session management

### Performance Considerations

-   Minimal dependency usage
-   Efficient AT Protocol queries
-   Local caching where appropriate
-   Optimized asset loading

### Browser Support

-   Focus on modern browsers but maintaining legacy appearance
-   Graceful degradation of features
-   No requirement for modern CSS features
-   Simple, reliable functionality over modern optimization

### Security Considerations

-   Secure credential handling
-   Protected AT Protocol interactions
-   Input validation
-   XSS prevention
-   CORS compliance

## Development Guidelines

-   Clean, modular code
-   Comprehensive documentation
-   Consistent styling
-   Error handling
-   Testing requirements

## Future Considerations

-   Enhanced theme customization
-   Extended profile features
-   Additional social integrations
-   Analytics integration
-   Performance optimization

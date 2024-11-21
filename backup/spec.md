# Top8.space Specification Document

## Overview

Top8.space is a static web application that allows users to create and manage their "Top 8 Friends" list using the Bluesky/AT Protocol ecosystem. Users can customize their profiles, manage their friend lists, and interact with other users' profiles while maintaining all data through AT Protocol records.

## Core Features

### 1. Authentication

-   Users authenticate using their Bluesky credentials
-   Authentication state is managed through local storage
-   Implementation of secure session handling via AT Protocol
-   No server-side state management required (static only)

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
    -   Drag-and-drop reordering
    -   Search functionality for finding friends
    -   Save/update functionality
-   Data storage:
    -   List is stored as an AT Protocol record
    -   Order preservation in the record
    -   Record type: "top8space" list

### 4. Theme System

-   Customizable theme support
-   Theme properties stored in AT Protocol record
-   Theme components:
    -   Color schemes
    -   Layout preferences
    -   Visual styling options
-   Theme persistence across sessions

### 5. Content Creation

-   Users can create and publish posts
-   Post creation interface
-   Integration with Bluesky post creation

### 6. Profile Viewing

-   View other profiles by DID
-   Display components:
    -   User's Top 8 list
    -   Profile information
    -   Custom theme
    -   Tagline
    -   Recent posts

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

### AT Protocol Records and Lists

#### Namespace and Record Types

Non-list records use the `app.top8space` namespace:

1. `app.top8space.theme`
2. `app.top8space.tagline`
3. `app.top8space.musicIntegration`

#### Top 8 List Implementation

The Top 8 list is implemented using AT Protocol's native list functionality:

1. Main List Record:

```typescript
interface Top8List {
    $type: "app.bsky.graph.list";
    name: "Top 8";
    purpose: "Top 8 Friends List";
    description?: string;
    createdAt: string;
}
```

2. List Items:

```typescript
interface Top8ListItem {
    $type: "app.bsky.graph.listitem";
    subject: string; // DID of the friend
    list: string; // URI of the parent list
    createdAt: string;
}
```

Example List URI:

```
at://{userDID}/app.bsky.graph.list/{listRkey}
```

Example List Item URI:

```
at://{userDID}/app.bsky.graph.listitem/{itemRkey}
```

#### List Order Management

Since AT Protocol list items don't inherently support ordering, we'll store the order in a separate record:

```typescript
interface Top8Order {
    $type: "app.top8space.listOrder";
    list: string; // URI of the Top 8 list
    order: string[]; // Array of list item URIs in desired order
    lastUpdated: string;
}
```

1. Theme Record:

```typescript
interface ThemeRecord {
    background: string;
    accent: string;
    text: string;
    layout: "classic" | "modern";
    customCSS?: string;
}
```

2. Top 8 List Record:

```typescript
interface Top8Record {
    friends: {
        did: string;
        order: number;
    }[];
    lastUpdated: string;
}
```

3. Tagline Record:

```typescript
interface TaglineRecord {
    text: string;
    lastUpdated: string;
}
```

4. Music Integration Record:

```typescript
interface MusicIntegrationRecord {
    services: {
        spotify?: string; // Just the profile URL
        appleMusic?: string; // Just the profile URL
        amazonMusic?: string; // Just the profile URL
        // Extensible for other music services
        [key: string]: string;
    };
    lastUpdated: string;
}
```

### User Interface Components

1. Profile Page

    - Header with user info
    - Theme customization panel
    - Top 8 friends display
    - Tagline editor
    - Music service integration panel
        - Add/edit music service profiles
        - Service-specific profile links
        - Optional: Featured track display
    - Post creation interface

2. Friend Management

    - Search interface
    - Friend selection
    - Order management
    - Save controls

3. Theme Editor

    - Color pickers
    - Layout options
    - Preview panel

4. Post Creator
    - Text input
    - Post button
    - Preview

### Music Integration Features

-   Simple URL-based integration
-   Support for:
    -   Spotify profile URLs
    -   Apple Music profile URLs
    -   Amazon Music profile URLs
    -   Extensible for additional services
-   Frontend URL parsing and validation
-   Service detection from URL patterns
-   Appropriate icon/button display based on service
-   Error handling for invalid URLs
-   URL validation and formatting

The frontend will:

1. Parse the URL to determine the service
2. Display appropriate service icons/buttons
3. Handle invalid or malformed URLs gracefully
4. Provide clear feedback for URL validation

URL Pattern Examples:

```typescript
const urlPatterns = {
    spotify: /^https:\/\/(?:open\.)?spotify\.com\/user\/[\w-]+$/,
    appleMusic: /^https:\/\/music\.apple\.com\/profile\/[\w-]+$/,
    amazonMusic: /^https:\/\/music\.amazon\.com\/user\/[\w-]+$/,
};
```

## Implementation Requirements

### Static Application Requirements

-   No server-side processing
-   All data stored in AT Protocol records
-   Client-side rendering only
-   Local storage for session management

### AT Protocol Integration

-   Record creation and management
-   Profile data fetching
-   Authentication flow
-   Post creation and retrieval

### User Experience

-   Responsive design
-   Intuitive friend management
-   Seamless theme switching
-   Fast profile loading
-   Efficient search functionality

### Performance Considerations

-   Minimal dependency usage
-   Efficient AT Protocol queries
-   Local caching where appropriate
-   Optimized asset loading

## Security Considerations

-   Secure credential handling
-   Protected AT Protocol interactions
-   Input validation
-   XSS prevention
-   CORS compliance

## Future Considerations

-   Enhanced theme customization
-   Extended profile features
-   Additional social integrations
-   Analytics integration
-   Performance optimization

## Development Guidelines

-   Clean, modular code
-   Comprehensive documentation
-   Consistent styling
-   Error handling
-   Testing requirements

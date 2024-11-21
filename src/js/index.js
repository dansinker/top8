// Import Alpine.js
import Alpine from "alpinejs";

// Import our modules
import "./config";
import "./auth";
import "./profile";
import "./storage";
import "./posts";
import "./pds";
import "./themePDS";
import "./top8";

// Import Alpine components
import "./alpine/alpine-core";
import "./alpine/alpine-auth";
import "./alpine/alpine-theme";
import "./alpine/alpine-posts";
import "./alpine/alpine-top8";

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

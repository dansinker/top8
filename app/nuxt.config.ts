// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  app: {
      head: {
          title: "Top8.space",
          meta: [
              { charset: "utf-8" },
              {
                  name: "viewport",
                  content: "width=device-width, initial-scale=1",
              },
              {
                  name: "description",
                  content: "Your MySpace-style Top 8 for Bluesky",
              },
          ],
          link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      },
  },

  runtimeConfig: {
      public: {
          baseUrl:
              process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      },
  },

  css: ["~/assets/css/main.css"],
  compatibilityDate: "2024-11-21",
});
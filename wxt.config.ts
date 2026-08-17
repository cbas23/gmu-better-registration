import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-solid"],
  srcDir: "src",

  manifest: ({ browser }) => ({
    name: "Better GMU Registration",
    description: "Enhances GMU course registration with RateMyProfessors data",
    host_permissions: ["https://www.ratemyprofessors.com/*"],
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "better-gmu-registration@cbas23",
          strict_min_version: "140.0",
          data_collection_permissions: {
            required: ["websiteContent"],
          },
        },
        gecko_android: {
          strict_min_version: "142.0",
        },
      },
    }),
  }),
  webExt: {
    startUrls: ["https://patriotweb.gmu.edu/"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

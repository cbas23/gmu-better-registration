import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-solid"],
  srcDir: "src",
  manifest: {
    host_permissions: ["https://www.ratemyprofessors.com/*"],
  },
  webExt: {
    startUrls: ["https://patriotweb.gmu.edu/"],
  },
});

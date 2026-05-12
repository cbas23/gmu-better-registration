import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-solid"],
  srcDir: "src",

  manifest: {
    name: "GMU Better Registration",
    description: "Enhances GMU course registration with RateMyProfessors data",
    version: "0.2.0",
    author: { email: "sebas.cardozo.scp@gmail.com" },
    host_permissions: ["https://www.ratemyprofessors.com/*"],
  },
  webExt: {
    startUrls: ["https://patriotweb.gmu.edu/"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

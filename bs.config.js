module.exports = {
  proxy: "https://russells-dynamite-site-39ffae.webflow.io/donovan-mitchell",   // your Webflow domain
  serveStatic: ["dist"],
  files: ["dist/**/*"],
  port: 3000,
  open: true,
  https: false
};

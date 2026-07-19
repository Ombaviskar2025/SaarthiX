// ============================================================
//  server.js  —  SaarthiX Local Development Server Bootloader
// ============================================================
const app = require('./api/index.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(` SaarthiX Indian Market Proxy Server listening on port ${PORT}`);
  console.log(` Access Dashboard at: http://localhost:${PORT}/dashboard.html`);
  console.log(`============================================================`);
});

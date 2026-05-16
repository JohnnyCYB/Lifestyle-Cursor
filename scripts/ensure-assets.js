/* Generates minimal valid PNGs so Expo can bundle without checked-in binaries. */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
for (const name of ['icon.png', 'splash-icon.png', 'adaptive-icon.png', 'favicon.png']) {
  const target = path.join(dir, name);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, png);
  }
}

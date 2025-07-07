const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const xpFile = path.join(dataDir, "xp.json");

function ensureFileExists() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(xpFile)) fs.writeFileSync(xpFile, "{}");
}

function loadXP() {
  ensureFileExists();

  try {
    const raw = fs.readFileSync(xpFile, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    console.error("❌ Gagal load XP file:", error);
    return {};
  }
}

function saveXP(data) {
  ensureFileExists();

  try {
    fs.writeFileSync(xpFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Gagal simpan XP file:", error);
  }
}

function removeXP(userId) {
  const xpData = loadXP();
  if (xpData[userId]) {
    delete xpData[userId];
    saveXP(xpData);
    return true;
  }
  return false;
}

function getXPForNextLevel(level) {
  // Bisa diganti sistem progresif (contoh: return 100 * Math.pow(level, 1.5));
  return level * 100;
}

module.exports = {
  loadXP,
  saveXP,
  removeXP,
  getXPForNextLevel,
};

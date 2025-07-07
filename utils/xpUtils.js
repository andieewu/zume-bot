// utils/xpUtils.js

const fs = require("fs");
const path = require("path");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

function loadXP() {
  return JSON.parse(fs.readFileSync(xpFile));
}

function saveXP(data) {
  fs.writeFileSync(xpFile, JSON.stringify(data, null, 2));
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
  return level * 100; // kamu bisa ubah ini nanti jadi sistem progresif
}

module.exports = {
  loadXP,
  saveXP,
  getXPForNextLevel,
  removeXP,
};

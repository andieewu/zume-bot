const fs = require("fs");
const path = require("path");
const { getXPForNextLevel } = require("../utils/xpUtils");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

module.exports = {
  name: "level",
  description: "Menampilkan level dan XP kamu saat ini.",
  async execute(message, args) {
    if (!fs.existsSync(xpFile)) {
      return message.reply("📂 Data XP belum tersedia.");
    }

    const xpData = JSON.parse(fs.readFileSync(xpFile));
    const userId = message.author.id;

    if (
      !xpData[userId] ||
      (xpData[userId].xp === 0 && xpData[userId].level === 1)
    ) {
      return message.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "❌ Belum Ada XP",
            description:
              "Kamu belum memiliki XP. Cobalah kirim pesan di chat terlebih dahulu!",
          },
        ],
      });
    }

    const { xp, level } = xpData[userId];
    const nextXP = getXPForNextLevel(level);
    const progress = Math.floor((xp / nextXP) * 100);

    const embed = {
      title: `${message.author.username} • Level ${level}`,
      description: `XP: **${xp}/${nextXP}** (${progress}%)`,
      color: 0x1abc9c,
      footer: {
        text: `Keep chatting untuk naik level!`,
      },
    };

    await message.channel.send({ embeds: [embed] });
  },
};

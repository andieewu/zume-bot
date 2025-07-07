const fs = require("fs");
const path = require("path");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

module.exports = {
  name: "leaderboard",
  description: "Menampilkan 5 pengguna teratas berdasarkan XP.",
  async execute(message) {
    if (!fs.existsSync(xpFile)) {
      return message.reply("📂 Data XP belum tersedia.");
    }

    const xpData = JSON.parse(fs.readFileSync(xpFile));

    const sorted = Object.entries(xpData)
      .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
      .slice(0, 5);

    const leaderboard = await Promise.all(
      sorted.map(async ([userId, data], index) => {
        const user = await message.guild.members
          .fetch(userId)
          .catch(() => null);
        const name = user ? user.user.username : "Unknown";
        return `${index + 1}. **${name}** – Level ${data.level} • ${
          data.xp
        } XP`;
      })
    );

    await message.channel.send({
      embeds: [
        {
          title: "🏆 Leaderboard XP",
          description: leaderboard.join("\n"),
          color: 0xf1c40f,
          footer: {
            text: "Semakin banyak yapping, semakin tinggi levelmu!",
          },
        },
      ],
    });
  },
};

const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const xpFile = "./data/xp.json";

module.exports = {
  name: "leaderboard",
  description: "Lihat peringkat XP",
  async execute(message) {
    const xpData = JSON.parse(fs.readFileSync(xpFile));
    const sorted = Object.entries(xpData)
      .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle("🏆 Leaderboard XP")
      .setColor("#7289DA");

    for (let i = 0; i < sorted.length; i++) {
      const [id, data] = sorted[i];

      const member = await message.guild.members.fetch(id).catch(() => null);
      const username = member?.user.username || "Unknown";

      embed.addFields({
        name: `#${i + 1} ${username}`,
        value: `Level: ${data.level} | XP: ${data.xp}/${data.level * 100}`,
        inline: false,
      });
    }

    message.channel.send({ embeds: [embed] });
  },
};

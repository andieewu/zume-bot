const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Menampilkan 5 pengguna teratas berdasarkan XP."),

  async execute(interaction) {
    if (!fs.existsSync(xpFile)) {
      return interaction.reply({
        content: "📂 Data XP belum tersedia.",
        ephemeral: true,
      });
    }

    const xpData = JSON.parse(fs.readFileSync(xpFile));

    const sorted = Object.entries(xpData)
      .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
      .slice(0, 5);

    if (sorted.length === 0) {
      return interaction.reply({
        content: "📊 Belum ada data XP untuk ditampilkan.",
        ephemeral: true,
      });
    }

    const emojis = ["🥇", "🥈", "🥉", "🏅", "🎖️"];

    const leaderboard = await Promise.all(
      sorted.map(async ([userId, data], index) => {
        const member = await interaction.guild.members
          .fetch(userId)
          .catch(() => null);
        const username = member ? member.user.username : "Unknown User";
        return `${emojis[index] || "🔹"} **${username}** — Level ${
          data.level
        } • ${data.xp} XP`;
      })
    );

    const embed = new EmbedBuilder()
      .setTitle("🏆 Top 5 Leaderboard XP")
      .setDescription(leaderboard.join("\n"))
      .setColor(0xf1c40f)
      .setFooter({
        text: "Semakin aktif, semakin tinggi posisimu!",
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

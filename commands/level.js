const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getXPForNextLevel } = require("../utils/xpUtils");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

function generateProgressBar(percent) {
  const totalBlocks = 20;
  const filled = Math.round((percent / 100) * totalBlocks);
  const empty = totalBlocks - filled;
  return `\`${"█".repeat(filled)}${"░".repeat(empty)}\` ${percent}%`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Menampilkan level dan XP kamu saat ini."),

  async execute(interaction) {
    const userId = interaction.user.id;

    if (!fs.existsSync(xpFile)) {
      return interaction.reply({
        content: "📂 Data XP belum tersedia.",
        ephemeral: true,
      });
    }

    const xpData = JSON.parse(fs.readFileSync(xpFile));

    if (
      !xpData[userId] ||
      (xpData[userId].level === 0 && xpData[userId].xp === 0)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("🚫 Belum Ada XP")
            .setDescription(
              "Kamu masih di level 0 dan belum punya XP.\nCobalah aktif di chat untuk mulai mengumpulkan XP!"
            ),
        ],
        ephemeral: true,
      });
    }

    const { xp, level } = xpData[userId];
    const nextXP = getXPForNextLevel(level);
    const progressPercent = Math.floor((xp / nextXP) * 100);
    const progressBar = generateProgressBar(progressPercent);

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setAuthor({
        name: `${interaction.user.username} • Level ${level}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `XP: **${xp.toLocaleString()} / ${nextXP.toLocaleString()}**\nProgress: ${progressBar}`
      )
      .setFooter({ text: "Terus aktif untuk naik level!" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

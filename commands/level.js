const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getXPForNextLevel } = require("../utils/xpUtils");

const xpFile = path.join(__dirname, "..", "data", "xp.json");

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
      (xpData[userId].xp === 0 && xpData[userId].level === 1)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Belum Ada XP")
            .setDescription(
              "Kamu belum memiliki XP. Cobalah kirim pesan di chat terlebih dahulu!"
            ),
        ],
        ephemeral: true,
      });
    }

    const { xp, level } = xpData[userId];
    const nextXP = getXPForNextLevel(level);
    const progressPercent = Math.floor((xp / nextXP) * 100);

    // Buat progress bar 10 blok
    const progressBlocks = Math.round((xp / nextXP) * 10);
    const progressBar =
      "🟩".repeat(progressBlocks) + "⬛".repeat(10 - progressBlocks);

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setAuthor({
        name: `${interaction.user.username} • Level ${level}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `XP: **${xp}/${nextXP}** (${progressPercent}%)\n${progressBar}`
      )
      .setFooter({ text: "Terus aktif untuk naik level!" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

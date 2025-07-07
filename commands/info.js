const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Menampilkan informasi tentang bot."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Informasi Bot")
      .setDescription(
        "Bot ini dibuat untuk memberi pengalaman interaktif seperti sistem level, leaderboard, dan command modular."
      )
      .setColor(0x5865f2)
      .addFields(
        { name: "Author", value: "Sogoi / Kamu 👤", inline: true },
        { name: "Prefix", value: "`!`", inline: true },
        { name: "Bahasa", value: "JavaScript (Node.js)", inline: true }
      )
      .setFooter({
        text: "Terima kasih sudah menggunakan bot ini!",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

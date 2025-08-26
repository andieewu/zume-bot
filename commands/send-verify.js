const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-verify")
    .setDescription("Kirim pesan verifikasi umur 18+ ke channel"),

  async execute(interaction) {
    const button = new ButtonBuilder()
      .setCustomId("verify_age")
      .setLabel("✅ Klik untuk Verifikasi 18+")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      content: "Silakan klik tombol di bawah untuk verifikasi umur 18+",
      components: [row],
    });
  },
};

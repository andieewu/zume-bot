const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot akan mengulangi pesan kamu.")
    .addStringOption((option) =>
      option.setName("pesan").setDescription("Isi pesan").setRequired(true)
    ),

  async execute(interaction) {
    const pesan = interaction.options.getString("pesan");

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setDescription(pesan)
      .setFooter({ text: `Dikirim oleh ${interaction.user.username}` });

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      // Jika error karena sudah di-reply sebelumnya
      if (interaction.deferred || interaction.replied) {
        console.warn("⚠️ Sudah acknowledged, tidak bisa reply ulang.");
      } else {
        await interaction.reply({
          content: "❌ Terjadi kesalahan saat mengirim pesan.",
          ephemeral: true,
        });
      }
      console.error("❌ Error saat menjalankan /say:", err);
    }
  },
};

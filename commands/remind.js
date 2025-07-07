const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Setel pengingat sederhana dalam beberapa detik.")
    .addIntegerOption((option) =>
      option
        .setName("detik")
        .setDescription("Berapa detik hingga pengingat dikirim")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("pesan")
        .setDescription("Isi pesan pengingat")
        .setRequired(true)
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger("detik");
    const message = interaction.options.getString("pesan");

    if (seconds <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Waktu Tidak Valid")
            .setDescription("Waktu harus berupa angka positif (dalam detik)."),
        ],
        ephemeral: true,
      });
    }

    const targetTime = new Date(Date.now() + seconds * 1000);
    const formattedTime = `<t:${Math.floor(targetTime.getTime() / 1000)}:T>`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("📌 Pengingat Disetel")
          .setDescription(
            `Saya akan mengingatkan kamu dalam **${seconds} detik** (${formattedTime}).`
          ),
      ],
      ephemeral: true, // hanya user yang bisa lihat
    });

    setTimeout(() => {
      interaction.followUp({
        content: `<@${interaction.user.id}>`,
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("🔔 Pengingat")
            .setDescription(message),
        ],
      });
    }, seconds * 1000);
  },
};

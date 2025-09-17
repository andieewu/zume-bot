const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spam")
    .setDescription("Spam chat dengan pesan tertentu (hanya admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("pesan")
        .setDescription("Isi pesan yang akan di-spam")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("jumlah")
        .setDescription("Berapa kali spam? (default: 5)")
        .setMinValue(1)
        .setMaxValue(50)
    ),

  async execute(interaction) {
    const pesan = interaction.options.getString("pesan");
    const jumlah = interaction.options.getInteger("jumlah") || 5;

    // acknowledge dulu (jawaban cepat ke Discord)
    await interaction.reply({
      content: `🚨 Mulai spam ${jumlah}x dengan pesan:\n> ${pesan}`,
      flags: MessageFlags.Ephemeral, // ✅ ganti dari "ephemeral"
    });

    // kirim spam di channel
    for (let i = 0; i < jumlah; i++) {
      await interaction.channel.send(pesan);
    }
  },
};

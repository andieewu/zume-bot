const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spam")
    .setDescription("Spam chat dengan pesan tertentu (hanya admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("pesan")
        .setDescription("Isi pesan yang akan di spam")
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

    // acknowledge dulu biar ga error
    await interaction.deferReply({ ephemeral: true });

    await interaction.editReply(
      `🚨 Mulai spam ${jumlah}x dengan pesan:\n> ${pesan}`
    );

    for (let i = 0; i < jumlah; i++) {
      await interaction.channel.send(pesan);
    }
  },
};

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const initDB = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-verify")
    .setDescription("Kirim pesan verifikasi umur 18+ ke channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const db = await initDB();

    const row = await db.get(
      `SELECT channel_id FROM verify_channels WHERE guild_id = ?`,
      [guildId]
    );

    if (!row) {
      return interaction.reply({
        content: "❌ Channel verifikasi belum diset. Gunakan /setup-verify",
        ephemeral: true,
      });
    }

    const verifyChannel = interaction.guild.channels.cache.get(row.channel_id);
    if (!verifyChannel) {
      return interaction.reply({
        content: "❌ Channel verifikasi tidak ditemukan di server!",
        ephemeral: true,
      });
    }

    const button = new ButtonBuilder()
      .setCustomId("verify_age")
      .setLabel("👆 Klik untuk Verifikasi")
      .setStyle(ButtonStyle.Primary);

    const rowBtn = new ActionRowBuilder().addComponents(button);

    await verifyChannel.send({
      content:
        "**Silakan klik tombol di bawah untuk verifikasi bahwa kamu sudah berumur 18+",
      components: [rowBtn],
    });

    await interaction.reply({
      content: `✅ Pesan verifikasi berhasil dikirim ke ${verifyChannel}`,
      ephemeral: true,
    });
  },
};

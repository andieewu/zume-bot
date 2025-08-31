const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../config.json");
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-verify")
    .setDescription("Kirim pesan verifikasi umur 18+ ke channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const verifyChannelId = config[guildId]?.verifyChannel;

    if (!verifyChannelId)
      return interaction.reply({
        content: "❌ Channel verifikasi belum diset. Gunakan /setup-verify",
        ephemeral: true,
      });

    const verifyChannel = interaction.guild.channels.cache.get(verifyChannelId);
    if (!verifyChannel)
      return interaction.reply({
        content: "❌ Channel verifikasi tidak ditemukan di server!",
        ephemeral: true,
      });

    const button = new ButtonBuilder()
      .setCustomId("verify_age")
      .setLabel("👆 Klik untuk Verifikasi")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await verifyChannel.send({
      content: "**Silakan klik tombol di bawah untuk verifikasi umur 18+**",
      components: [row],
    });

    await interaction.reply({
      content: `✅ Pesan verifikasi berhasil dikirim ke ${verifyChannel}`,
      ephemeral: true,
    });
  },
};

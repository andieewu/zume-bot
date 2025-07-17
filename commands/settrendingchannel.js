const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../data/trending_config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settrendingchannel")
    .setDescription(
      "Set channel untuk menerima notifikasi game trending Roblox"
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel tujuan notifikasi trending")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Hanya admin yang bisa pakai
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content:
          "❌ Kamu harus punya izin **Administrator** untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }

    const selectedChannel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      console.error("❌ Gagal membaca trending_config.json:", err);
    }

    if (!config.guilds) config.guilds = {};
    config.guilds[guildId] = {
      channelId: selectedChannel.id,
    };

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return interaction.reply(
        `✅ Channel notifikasi trending diatur ke <#${selectedChannel.id}>.`
      );
    } catch (err) {
      console.error("❌ Gagal menyimpan konfigurasi:", err);
      return interaction.reply({
        content: "❌ Gagal menyimpan konfigurasi.",
        ephemeral: true,
      });
    }
  },
};

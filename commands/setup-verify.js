const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-verify")
    .setDescription("Set channel untuk log verifikasi umur 18+")
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, config, configPath) {
    const channel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    if (!config[guildId]) config[guildId] = {};
    config[guildId].verifyChannel = channel.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply(
      `✅ Channel verifikasi umur berhasil diset ke ${channel}`
    );
  },
};

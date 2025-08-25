const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set channel untuk welcome message.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel tujuan welcome message")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, config, configPath) {
    const channel = interaction.options.getChannel("channel");

    if (!config[interaction.guild.id]) {
      config[interaction.guild.id] = {};
    }
    config[interaction.guild.id].welcomeChannel = channel.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply(
      `Success! Welcome channel berhasil diset ke ${channel}`
    );
  },
};

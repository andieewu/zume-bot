const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup channel untuk berbagai fitur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("welcome")
        .setDescription("Set channel welcome message")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Channel").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("verify")
        .setDescription("Set channel verifikasi umur 18+")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Channel").setRequired(true)
        )
    ),

  async execute(interaction, config, configPath) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    if (!config[guildId]) config[guildId] = {};

    if (subcommand === "welcome") {
      config[guildId].welcomeChannel = channel.id;
      await interaction.reply(`✅ Welcome channel diset ke ${channel}`);
    } else if (subcommand === "verify") {
      config[guildId].verifyChannel = channel.id;
      await interaction.reply(`✅ Channel verifikasi umur diset ke ${channel}`);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },
};

const { SlashCommandBuilder, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../data/trending_config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trending-setup")
    .setDescription(
      "Setel channel dan region untuk notifikasi game trending Roblox."
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel tempat notifikasi akan dikirim.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("region")
        .setDescription("Wilayah filter trending (global atau indonesia).")
        .setRequired(true)
        .addChoices(
          { name: "Global", value: "global" },
          { name: "Indonesia", value: "indonesia" }
        )
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const region = interaction.options.getString("region");

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    config.guilds = config.guilds || {};
    config.guilds[interaction.guildId] = {
      channelId: channel.id,
      region: region,
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Notifikasi trending akan dikirim ke <#${channel.id}> untuk wilayah **${region}**.`,
      ephemeral: true,
    });
  },
};

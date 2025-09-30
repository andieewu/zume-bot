const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-welcome")
    .setDescription("Set channel untuk welcome message")
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, db) {
    const channel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    await db.run(
      `INSERT INTO welcome_channels (guild_id, channel_id)
   VALUES (?, ?)
   ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id`,
      [guildId, channel.id]
    );

    await interaction.reply(`✅ Welcome channel berhasil diset ke ${channel}`);
  },
};

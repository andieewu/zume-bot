const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show-db")
    .setDescription("Lihat data database bot (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, db) {
    const verify = await db.all("SELECT * FROM verify_settings");
    const welcome = await db.all("SELECT * FROM welcome_channels");

    let msg = "**Verify Settings:**\n";
    verify.forEach((r) => {
      msg += `Guild: ${r.guild_id}, Role: ${r.role_id}\n`;
    });

    msg += "\n**Welcome Channels:**\n";
    welcome.forEach((r) => {
      msg += `Guild: ${r.guild_id}, Channel: ${r.channel_id}\n`;
    });

    await interaction.reply({
      content: msg || "Tidak ada data.",
      ephemeral: true,
    });
  },
};

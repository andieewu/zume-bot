const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-verify")
    .setDescription("Set role target untuk verifikasi umur 18+")
    .addRoleOption((opt) =>
      opt
        .setName("role")
        .setDescription("Role yang diberikan setelah verifikasi berhasil")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    db.prepare(
      `
      INSERT INTO verify_settings (guild_id, role_id)
      VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET role_id = excluded.role_id
    `
    ).run(interaction.guild.id, role.id);

    await interaction.reply({
      content: `✅ Role verifikasi diset ke ${role}`,
      ephemeral: true,
    });
  },
};

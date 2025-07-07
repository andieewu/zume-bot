const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Menguji koneksi bot dengan Discord API."),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: "⏳ Mengukur ping...",
      fetchReply: true,
    });

    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🏓 Pong!")
      .setDescription(
        `**Bot Latency:** \`${botLatency}ms\`\n**API Latency:** \`${apiLatency}ms\``
      )
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};

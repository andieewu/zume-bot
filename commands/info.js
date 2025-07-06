const { EmbedBuilder, Guild } = require("discord.js");

module.exports = {
  name: "info",
  description: "Menampilkan informasi tentang server ini.",
  execute(message) {
    const { guild } = message;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Informasi Server")
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: "Nama Server", value: guild.name, inline: true },
        { name: "Total Member", value: `${guild.memberCount}`, inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        {
          name: "Dibuat Pada",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
        }
      )
      .setFooter({
        text: `Diminta oleh ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      });

    message.channel.send({ embeds: [embed] });
  },
};

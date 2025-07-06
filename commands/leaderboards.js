module.exports = {
  name: "leaderboard",
  description: "Lihat peringkat XP",
  async execute(message) {
    const xpData = JSON.parse(fs.readFileSync(xpFile));
    const sorted = Object.entries(xpData)
      .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
      .slice(0, 10);

    const embed = new MessageEmbed()
      .setTitle("🏆 Leaderboard XP")
      .setColor("#7289DA");

    sorted.forEach(([id, data], index) => {
      embed.addField(
        `#${index + 1} ${
          message.guild.members.cache.get(id)?.user.username || "Unknown"
        }`,
        `Level: ${data.level} | XP: ${data.xp}/${data.level * 100}`
      );
    });

    message.channel.send({ embeds: [embed] });
  },
};

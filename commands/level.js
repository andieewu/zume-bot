const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const xpFile = "./data/xp.json";

module.exports = {
  name: "level",
  description: "Cek level dan XP kamu",
  execute(message) {
    const xpData = JSON.parse(fs.readFileSync(xpFile));
    const user = xpData[message.author.id];

    if (!user) {
      return message.reply("Kamu belum punya XP. Ayo mulai aktif ngobrol!");
    }

    const nextLevelXP = user.level * 100;
    const progress = Math.min(Math.floor((user.xp / nextLevelXP) * 100), 100);

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`Level Stats - ${message.author.username}`)
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: "Level", value: user.level.toString(), inline: true },
        { name: "XP", value: `${user.xp}/${nextLevelXP}`, inline: true },
        { name: "Progress", value: `${progress}%`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

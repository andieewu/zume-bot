const fs = require("fs");
const xpFile = "./data/xp.json";

module.exports = {
  name: "level",
  description: "Cek level kamu.",
  execute(message) {
    const xpData = JSON.parse(fs.readFileSync(xpFile));
    const user = xpData[message.author.id];

    if (!user) {
      return message.reply("Kamu belum punya XP. Ayo mulai ngobrol!");
    }

    const nextXP = user.level * 100;
    message.reply(
      `Kamu ada di level ${user.level} dengan ${user.xp}/${nextXP} XP.`
    );
  },
};

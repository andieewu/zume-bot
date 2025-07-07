const { loadXP, saveXP, getXPForNextLevel } = require("../utils/xpUtils");
const cooldowns = new Map();

async function handleXP(message) {
  const userId = message.author.id;
  const guild = message.guild;

  let xpData = loadXP();

  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 1 };
  }

  const DISABLE_COOLDOWN = true;

  if (!DISABLE_COOLDOWN) {
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 60_000) return;
    cooldowns.set(userId, now);
  }

  // Cek channel yang tidak memberi XP
  const ignoredChannels = ["welcome", "level"];
  if (ignoredChannels.includes(message.channel.name)) return;

  if (message.content.startsWith("!")) return;

  // Random XP 5–10
  const gain = Math.floor(Math.random() * 6) + 5;

  xpData[userId].xp += gain;

  const currentLevel = xpData[userId].level;
  const nextXP = getXPForNextLevel(currentLevel);

  if (xpData[userId].xp >= nextXP) {
    xpData[userId].xp -= nextXP;
    xpData[userId].level += 1;

    const newLevel = xpData[userId].level;
    const levelChannel =
      guild.channels.cache.find((ch) => ch.name === "level" && ch.type === 0) ||
      message.channel;

    const member = guild.members.cache.get(userId);
    const rookieRole = guild.roles.cache.find((r) => r.name === "Rookie");
    const memberRole = guild.roles.cache.find((r) => r.name === "Member");

    if (
      newLevel === 10 &&
      member &&
      rookieRole &&
      memberRole &&
      member.roles.cache.has(rookieRole.id)
    ) {
      try {
        await member.roles.remove(rookieRole);
        await member.roles.add(memberRole);

        await levelChannel.send({
          embeds: [
            {
              title: `🎉 Level Up!`,
              description: `<@${userId}> telah naik ke **Level ${newLevel}**!`,
              color: 0x00ff00,
              footer: {
                text: "Terus aktif dan raih level berikutnya 💪",
              },
            },
          ],
        });
      } catch (err) {
        console.error("❌ Gagal update role:", err);
      }
    } else {
      await levelChannel.send(`🎉 <@${userId}> naik ke **Level ${newLevel}**!`);
    }
  }

  saveXP(xpData);
}

module.exports = { handleXP };

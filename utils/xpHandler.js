const { loadXP, saveXP, getXPForNextLevel } = require("../utils/xpUtils");
const cooldowns = new Map();

const DISABLE_COOLDOWN = true;

async function handleXP(input) {
  const isInteraction = !!input.isChatInputCommand;
  const userId = isInteraction ? input.user.id : input.author.id;
  const guild = input.guild;
  const channel = input.channel;

  if (!guild || !channel || input.user?.bot || input.author?.bot) return;

  const ignoredChannels = ["welcome", "level"];
  if (ignoredChannels.includes(channel.name)) return;

  if (!isInteraction && input.content.startsWith("!")) return;

  let xpData = loadXP();

  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 0 };
  }

  if (!DISABLE_COOLDOWN) {
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 60_000) return;
    cooldowns.set(userId, now);
  }

  if (!isInteraction) {
    const gain = Math.floor(Math.random() * 6) + 5;
    xpData[userId].xp += gain;
  }

  let currentLevel = xpData[userId].level;
  let totalLevelUps = 0;

  while (xpData[userId].xp >= getXPForNextLevel(currentLevel)) {
    const nextXP = getXPForNextLevel(currentLevel);
    xpData[userId].xp -= nextXP;
    currentLevel++;
    totalLevelUps++;
  }

  if (totalLevelUps > 0) {
    xpData[userId].level = currentLevel;

    const levelChannel =
      guild.channels.cache.find((ch) => ch.name === "level" && ch.type === 0) ||
      channel;

    try {
      const member = await guild.members.fetch(userId);
      const rookieRole = guild.roles.cache.find((r) => r.name === "Rookie");
      const memberRole = guild.roles.cache.find((r) => r.name === "Member");

      if (
        currentLevel >= 10 &&
        member &&
        rookieRole &&
        memberRole &&
        member.roles.cache.has(rookieRole.id)
      ) {
        await member.roles.remove(rookieRole);
        await member.roles.add(memberRole);

        await levelChannel.send({
          embeds: [
            {
              title: `🎉 Level Up!`,
              description: `<@${userId}> telah naik ke **Level ${currentLevel}** dan kini menjadi **${memberRole.name}**!`,
              color: 0x00ff00,
              footer: {
                text: "Terus aktif dan raih level berikutnya 💪",
              },
            },
          ],
        });
      } else {
        await levelChannel.send(
          `🎉 <@${userId}> naik ke **Level ${currentLevel}**!`
        );
      }
    } catch (err) {
      console.error("❌ Gagal update role:", err);
    }
  }

  saveXP(xpData);
}

module.exports = { handleXP };

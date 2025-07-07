const { loadXP, saveXP, getXPForNextLevel } = require("../utils/xpUtils");
const cooldowns = new Map();

const DISABLE_COOLDOWN = true; // Ganti ke false untuk aktifkan cooldown

async function handleXP(input) {
  const isInteraction = !!input.isChatInputCommand;
  const userId = isInteraction ? input.user.id : input.author.id;
  const guild = input.guild;
  const channel = input.channel;

  if (!guild || !channel || input.user?.bot || input.author?.bot) return;

  // Tidak beri XP jika channel di-ignore
  const ignoredChannels = ["welcome", "level"];
  if (ignoredChannels.includes(channel.name)) return;

  // Tidak beri XP jika perintah prefix (!)
  if (!isInteraction && input.content.startsWith("!")) return;

  let xpData = loadXP();

  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 1 };
  }

  // Cooldown 60 detik
  if (!DISABLE_COOLDOWN) {
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 60_000) return;
    cooldowns.set(userId, now);
  }

  // Tambah XP acak 5–10
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
      channel;

    try {
      const member = await guild.members.fetch(userId);
      const rookieRole = guild.roles.cache.find((r) => r.name === "Rookie");
      const memberRole = guild.roles.cache.find((r) => r.name === "Member");

      if (
        newLevel === 10 &&
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
              description: `<@${userId}> telah naik ke **Level ${newLevel}** dan kini menjadi **${memberRole.name}**!`,
              color: 0x00ff00,
              footer: {
                text: "Terus aktif dan raih level berikutnya 💪",
              },
            },
          ],
        });
      } else {
        await levelChannel.send(
          `🎉 <@${userId}> naik ke **Level ${newLevel}**!`
        );
      }
    } catch (err) {
      console.error("❌ Gagal update role:", err);
    }
  }

  saveXP(xpData);
}

module.exports = { handleXP };

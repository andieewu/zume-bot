require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const { handleXP, removeXP } = require("./utils/xpHandler"); // 🛠️ Pastikan ada removeXP di sini
const { getTrendingGames } = require("./utils/robloxTrending");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// 🔁 Load semua command dari folder /commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(
      `[WARNING] Command di ${file} tidak punya properti 'name' atau 'execute'.`
    );
  }
}

// 🔔 Scheduler: Trending Game Roblox
const configPath = path.join(__dirname, "data/trending_config.json");
const cachePath = path.join(__dirname, "data/trending_cache.json");

function startTrendingScheduler() {
  const now = new Date();
  const targetHour = 8;
  const delayMs = computeNextDelay(now, targetHour);

  setTimeout(() => {
    sendTrendingNotification();
    setInterval(sendTrendingNotification, 24 * 60 * 60 * 1000);
  }, delayMs);
}

function computeNextDelay(now, targetHour = 8) {
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

async function sendTrendingNotification(client) {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    return console.warn("⚠️ Tidak dapat membaca trending_config.json");
  }

  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf-8"))
    : { guilds: {} };

  // Ambil semua trending sekaligus
  const allGames = {
    global: await getTrendingGames("global"),
    indonesia: await getTrendingGames("indonesia"),
  };

  for (const guildId in config.guilds) {
    const { channelId, region = "global" } = config.guilds[guildId];
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    const games = allGames[region];
    if (!games?.length) continue;

    const lastNames = (cache.guilds?.[guildId]?.games || []).map((g) => g.name);
    const currentNames = games.map((g) => g.name);

    const isChanged =
      JSON.stringify(lastNames) !== JSON.stringify(currentNames);
    if (!isChanged) {
      console.log(`✅ ${guild.name} – Tidak ada perubahan trending ${region}.`);
      continue;
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `📈 Game Roblox Trending (${
          region === "indonesia" ? "Indonesia" : "Global"
        })`
      )
      .setColor("#0099ff")
      .setTimestamp();

    games.forEach((game, i) => {
      embed.addFields({
        name: `#${i + 1} ${game.name}`,
        value: `[Mainkan di Roblox](${game.url})\n👥 ${game.players} | ⭐ ${game.rating}`,
      });
    });

    try {
      await channel.send({ embeds: [embed] });
      console.log(`✅ Trending terkirim ke ${guild.name} (${region})`);
    } catch (err) {
      console.warn(`❌ Gagal kirim ke ${guild.name}:`, err.message);
    }

    // Simpan cache per guild
    cache.guilds = cache.guilds || {};
    cache.guilds[guildId] = { games };
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

// 🔓 Ketika bot siap
client.once("ready", () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
  startTrendingScheduler(); // Mulai scheduler
});

// 💬 Saat user kirim pesan teks biasa
client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channel.type !== 0) return;
  await handleXP(message);
});

// 📥 Slash command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await handleXP(interaction);
  } catch (err) {
    console.warn("Gagal memberi XP saat slash command:", err);
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error di command "${interaction.commandName}":`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Terjadi kesalahan saat menjalankan perintah.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Terjadi kesalahan saat menjalankan perintah.",
        ephemeral: true,
      });
    }
  }
});

// 👋 Welcome system
client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const channel =
    guild.systemChannel ||
    guild.channels.cache.find((ch) => ch.name === "welcome" && ch.type === 0);

  if (member.user.bot) {
    const botRole = guild.roles.cache.find((r) => r.name === "Bot");
    if (botRole) {
      try {
        await member.roles.add(botRole);
        console.log(`🤖 Bot ${member.user.tag} diberi role Bot.`);
      } catch (err) {
        console.error("❌ Gagal memberi role Bot:", err);
      }
    }
    return;
  }

  const rookieRole = guild.roles.cache.find((r) => r.name === "Rookie");

  if (rookieRole) {
    try {
      await member.roles.add(rookieRole);
      console.log(`✅ Role Rookie diberikan ke ${member.user.tag}`);
      if (channel) {
        await channel.send({
          content: `👋 Selamat datang <@${member.id}>!`,
          embeds: [
            {
              title: `Selamat Bergabung di ${guild.name}!`,
              description: `Kamu telah diberikan role **${rookieRole.name}**. Jangan lupa baca rules dan mulai mengobrol untuk naik level!`,
              color: 0x00ff00,
              footer: { text: "Semoga betah di server ini!" },
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }
    } catch (err) {
      console.error("❌ Gagal memberi role Rookie:", err);
    }
  } else {
    console.warn("⚠️ Role Rookie tidak ditemukan di server.");
  }
});

// 👋 Saat member keluar
client.on("guildMemberRemove", async (member) => {
  const removed = removeXP(member.id);
  const displayName = member.user?.tag || member.displayName || member.id;

  if (removed) {
    console.log(`🗑️ XP ${displayName} dihapus karena keluar server.`);
  } else {
    console.log(`ℹ️ Tidak ada XP untuk ${displayName}.`);
  }
});

client.login(process.env.DISCORD_TOKEN);

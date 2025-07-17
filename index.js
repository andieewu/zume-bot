require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { handleXP } = require("./utils/xpHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

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

client.once("ready", () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channel.type !== 0) return;
  await handleXP(message);
});

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
              footer: {
                text: "Semoga betah di server ini!",
              },
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

client.on("guildMemberRemove", async (member) => {
  const userId = member.id;
  const removed = removeXP(userId);

  const displayName = member.user?.tag || member.displayName || member.id;

  if (removed) {
    console.log(
      `🗑️ XP untuk ${displayName} telah dihapus karena keluar dari server.`
    );
  } else {
    console.log(`ℹ️ Tidak ada data XP untuk ${displayName}.`);
  }
});

client.login(process.env.DISCORD_TOKEN);

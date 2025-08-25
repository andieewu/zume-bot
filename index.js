require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// Load config
const configPath = path.join(__dirname, "config.json");
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
});

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, config, configPath);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Ada error saat menjalankan perintah.",
      ephemeral: true,
    });
  }
});

// Welcome message
client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return;

  const guildId = member.guild.id;
  const channelId = config[guildId]?.welcomeChannel;

  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  await channel.send({
    content: `Halo @everyone! Ada yang baru gabung nih, selamat datang <@${member.id}> 👋\nCoba dong disapa biar bisa saling kenal!`,
  });
});

client.login(process.env.DISCORD_TOKEN);

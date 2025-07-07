const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `[WARNING] File ${file} tidak memiliki properti 'data' atau 'execute'.`
    );
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

(async () => {
  try {
    console.log("🔁 Menyinkronkan slash commands...");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("✅ Slash commands berhasil disinkronkan.");
  } catch (error) {
    console.error("❌ Gagal sync slash commands:", error);
  }
})();

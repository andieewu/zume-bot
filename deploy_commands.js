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
      `[WARNING] File ${file} tidak memiliki 'data' atau 'execute'.`
    );
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const mode = process.argv[2] || "dev"; // dev | prod | clear

(async () => {
  try {
    if (mode === "clear") {
      console.log("🗑️ Menghapus semua global command...");
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log("✅ Semua global command terhapus.");
      return;
    }

    console.log(`🔁 Syncing slash commands in ${mode} mode...`);

    if (mode === "dev") {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log("✅ Guild (dev) commands synced.");
    } else if (mode === "prod") {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("✅ Global (prod) commands synced.");
    } else {
      console.log("⚠️ Mode tidak dikenali. Gunakan: dev | prod | clear");
    }
  } catch (error) {
    console.error("❌ Gagal sync commands:", error);
  }
})();

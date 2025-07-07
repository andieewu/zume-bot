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

const mode = process.argv[2] === "prod" ? "prod" : "dev";

(async () => {
  try {
    console.log(`🔁 Syncing slash commands in ${mode} mode...`);

    if (mode === "dev") {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log("✅ Guild (dev) commands synced.");
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("✅ Global (prod) commands synced.");
    }
  } catch (error) {
    console.error("❌ Gagal sync commands:", error);
  }
})();

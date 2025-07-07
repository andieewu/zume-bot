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

// Gunakan REST client
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Tentukan ID dari bot dan server (jika ingin hanya untuk 1 guild)
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // opsional jika hanya ingin untuk 1 server

(async () => {
  try {
    console.log("🔁 Menyinkronkan slash commands...");

    // 🔁 Global commands (muncul di semua server, tapi delay 1 jam)
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    // ✅ Jika ingin cepat muncul, gunakan ini (khusus 1 server)
    // await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    //   body: commands,
    // });

    console.log("✅ Slash commands berhasil disinkronkan.");
  } catch (error) {
    console.error("❌ Gagal sync slash commands:", error);
  }
})();

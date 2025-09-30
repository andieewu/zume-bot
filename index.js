require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActivityType,
} = require("discord.js");

const initDB = require("./initDB");
let db;

(async () => {
  db = await initDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS welcome_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    )
  `);
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

const fs = require("fs");
const path = require("path");
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

function setBotPresence(client) {
  const activities = [
    { name: "@andieewu", type: ActivityType.Listening },
    { name: "Victim", type: ActivityType.Playing },
    { name: "Zume Ganteng", type: ActivityType.Watching },
  ];

  const activity = activities[Math.floor(Math.random() * activities.length)];

  client.user.setPresence({
    activities: [activity],
    status: "dnd",
  });

  console.log(`✅ Presence updated: ${activity.type} ${activity.name}`);
}

client.once("ready", () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
  setBotPresence(client);

  setInterval(() => setBotPresence(client), 5 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, db);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Ada error saat menjalankan perintah.",
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "verify_age") {
      const modal = new ModalBuilder()
        .setCustomId("verify_modal")
        .setTitle("Verifikasi Umur 18+");

      const dobInput = new TextInputBuilder()
        .setCustomId("dob")
        .setLabel("Masukkan tanggal lahir (format: YYYY-MM-DD)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Contoh: 2000-05-12")
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(dobInput);
      modal.addComponents(row);

      return await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "verify_modal") {
      const dob = interaction.fields.getTextInputValue("dob");

      let age = null;
      try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) throw new Error("Format salah");

        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      } catch (err) {
        return await interaction.reply({
          content: "❌ Format tanggal salah! Gunakan format `YYYY-MM-DD`.",
          ephemeral: true,
        });
      }

      if (age < 18) {
        return await interaction.reply({
          content: "❌ Verifikasi gagal. Umur kamu belum cukup 18+.",
          ephemeral: true,
        });
      }

      const row = await db.get(
        "SELECT role_id FROM verify_settings WHERE guild_id = ?",
        [interaction.guild.id]
      );

      if (!row) {
        return await interaction.reply({
          content: "❌ Role verifikasi belum diset. Gunakan /setup-verify.",
          ephemeral: true,
        });
      }

      const roleId = row.role_id;
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return await interaction.reply({
          content: "❌ Role target tidak ditemukan. Pastikan ID role benar.",
          ephemeral: true,
        });
      }

      if (interaction.member.roles.cache.has(roleId)) {
        return await interaction.reply({
          content: `⚠️ Kamu sudah pernah verifikasi dan memiliki role <@&${roleId}>`,
          ephemeral: true,
        });
      }

      await interaction.member.roles.add(role);

      await interaction.reply({
        content: `✅ Verifikasi berhasil! Kamu sudah mendapatkan role <@&${roleId}>`,
        ephemeral: true,
      });
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return;

  const row = await db.get(
    "SELECT channel_id FROM welcome_channels WHERE guild_id = ?",
    [member.guild.id]
  );
  if (!row) return;

  const channel = member.guild.channels.cache.get(row.channel_id);
  if (!channel) return;

  await channel.send({
    content: `Halo @everyone! Ada yang baru gabung nih, selamat datang <@${member.id}> 👋\nCoba dong disapa biar bisa saling kenal!`,
  });
});

client.login(process.env.DISCORD_TOKEN);

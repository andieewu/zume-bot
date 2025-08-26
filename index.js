require("dotenv").config();
const fs = require("fs");
const path = require("path");
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
} = require("discord.js");

const configPath = path.join(__dirname, "config.json");
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

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

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
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

      const ROLE_ID = "1402557967727071374"; // ROLE Senior
      const role = interaction.guild.roles.cache.get(ROLE_ID);

      if (!role) {
        return await interaction.reply({
          content: "❌ Role target tidak ditemukan. Pastikan ID role benar.",
          ephemeral: true,
        });
      }

      if (interaction.member.roles.cache.has(ROLE_ID)) {
        return await interaction.reply({
          content: `⚠️ Kamu sudah pernah verifikasi dan memiliki role <@&${ROLE_ID}>`,
          ephemeral: true,
        });
      }

      await interaction.member.roles.add(role);

      await interaction.reply({
        content: `✅ Verifikasi berhasil! Kamu sudah mendapatkan role <@&${ROLE_ID}>`,
        ephemeral: true,
      });
    }
  }
});

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

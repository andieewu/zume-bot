require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");

const xpFile = "./data/xp.json";
const xpCooldown = new Set();

// Buat folder data jika belum ada
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// Buat file xp.json jika belum ada
if (!fs.existsSync(xpFile)) {
  fs.writeFileSync(xpFile, "{}");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands dari folder commands/
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log(`Bot sudah online sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const userId = message.author.id;
  const guildId = message.guild.id;

  if (xpCooldown.has(userId)) return;
  xpCooldown.add(userId);
  setTimeout(() => xpCooldown.delete(userId), 60000);

  // Load data XP
  let xpData = {};
  try {
    xpData = JSON.parse(fs.readFileSync(xpFile));
  } catch (err) {
    xpData = {};
    fs.writeFileSync(xpFile, "{}");
  }

  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 1 };
  }

  // Tambah XP
  const gain = Math.floor(Math.random() * 6) + 5;
  xpData[userId].xp += gain;

  const nextXP = xpData[userId].level * 100;

  // Naik level
  if (xpData[userId].xp >= nextXP) {
    xpData[userId].xp -= nextXP;
    xpData[userId].level += 1;

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("🎉 Level Up!")
      .setDescription(
        `<@${userId}> sekarang **Level ${xpData[userId].level}**!`
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp();

    const levelChannel = message.guild.channels.cache.find(
      (ch) => ch.name === "level" && ch.type === 0
    );

    (levelChannel || message.channel).send({ embeds: [embed] });

    // Cek role saat level 10
    if (xpData[userId].level === 10) {
      const member = await message.guild.members
        .fetch(userId)
        .catch(() => null);
      const rookieRole = message.guild.roles.cache.find(
        (r) => r.name === "Rookie"
      );
      const memberRole = message.guild.roles.cache.find(
        (r) => r.name === "Member"
      );

      if (member && rookieRole && memberRole) {
        try {
          await member.roles.remove(rookieRole);
          await member.roles.add(memberRole);

          const notifyEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setDescription(`🎊 <@${userId}> sekarang menjadi **Member**!`);

          (levelChannel || message.channel).send({ embeds: [notifyEmbed] });
        } catch (err) {
          console.error("Error updating roles:", err);
        }
      }
    }
  }

  // Simpan data XP
  fs.writeFileSync(xpFile, JSON.stringify(xpData, null, 2));

  // Handle command
  const args = message.content.slice(1).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Ada kesalahan saat menjalankan perintah itu.");
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel =
    member.guild.systemChannel ||
    member.guild.channels.cache.find(
      (ch) => ch.name === "welcome" && ch.type === 0
    );

  if (channel) {
    channel.send({
      content: `<@${member.id}>`,
      embeds: [
        {
          title: `Selamat datang di ${member.guild.name}!`,
          description: "Jangan lupa baca rules ya!",
          color: 0x00ff00,
        },
      ],
    });
  }

  // AUTO ROLE
  const role = member.guild.roles.cache.find((r) => r.name === "Rookie");
  if (role) {
    try {
      await member.roles.add(role);
      console.log(`Berhasil memberi role ${role.name} ke ${member.user.tag}`);
    } catch (err) {
      console.error(`Gagal memberi role ke ${member.user.tag}:`, err);
    }
  } else {
    console.warn("Role tidak ditemukan!");
  }
});

client.login(process.env.DISCORD_TOKEN);

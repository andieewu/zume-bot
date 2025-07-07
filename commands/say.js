const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "say",
  description: "Bot akan mengulang pesan kamu dengan gaya yang keren.",
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Gagal Mengirim Pesan")
            .setDescription(
              "Kamu harus mengetik sesuatu.\nContoh: `!say Halo semua!`"
            )
            .setFooter({
              text: `Diminta oleh ${message.author.username}`,
              iconURL: message.author.displayAvatarURL(),
            }),
        ],
      });
    }

    const content = args.join(" ");

    // Coba hapus pesan pengguna
    // try {
    //   await message.delete();
    // } catch (err) {
    //   console.warn("Gagal hapus pesan pengguna:", err.message);
    // }

    // Buat embed interaktif
    const embed = new EmbedBuilder()
      .setColor("#00BFFF")
      .setDescription(content)
      .setFooter({
        text: `Dikirim oleh ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("delete_say")
        .setLabel("Hapus Pesan")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    );

    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    // Interaksi tombol
    const collector = sentMessage.createMessageComponentCollector({
      time: 60_000, // 1 menit
    });

    collector.on("collect", async (interaction) => {
      const isSender = interaction.user.id === message.author.id;
      const isMod = interaction.member.permissions.has(
        PermissionFlagsBits.ManageMessages
      );

      if (interaction.customId === "delete_say") {
        if (isSender || isMod) {
          await sentMessage.delete().catch(() => {});
          if (!isSender) {
            await interaction.reply({
              content: "✅ Pesan telah dihapus oleh moderator.",
              ephemeral: true,
            });
          }
        } else {
          await interaction.reply({
            content:
              "⚠️ Hanya pengirim atau moderator yang bisa menghapus pesan ini.",
            ephemeral: true,
          });
        }
      }
    });
  },
};

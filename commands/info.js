module.exports = {
  name: "info",
  description: "Menampilkan informasi tentang bot.",
  async execute(message) {
    const embed = {
      title: "🤖 Informasi Bot",
      description:
        "Bot Discord ini dibuat untuk memberi pengalaman interaktif dengan sistem level, leaderboard, dan command modular.",
      color: 0x5865f2,
      fields: [
        { name: "Author", value: "Sogoi / Kamu 👤", inline: true },
        { name: "Prefix", value: "`!`", inline: true },
        { name: "Bahasa", value: "JavaScript (Node.js)", inline: true },
      ],
      footer: {
        text: "Terima kasih sudah menggunakan bot ini!",
      },
      timestamp: new Date(),
    };

    await message.channel.send({ embeds: [embed] });
  },
};

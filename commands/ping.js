module.exports = {
  name: "ping",
  description: "Menguji koneksi bot.",
  async execute(message) {
    const sent = await message.channel.send("🏓 Pong...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong! Latensi: \`${latency}ms\``);
  },
};

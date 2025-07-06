module.exports = {
  name: "say",
  description: "Bot mengulang pesan (spam akan terhapus otomatis)",
  async execute(message, args) {
    if (!args.length) {
      return message.reply(
        "Contoh: `!say Hello` atau `!say Hello*3` (spam 3x)"
      );
    }

    const fullInput = args.join(" ");
    const match = fullInput.match(/^(.*)\*(\d{1,3})$/);

    await message.delete().catch(console.error);

    if (!match) {
      await message.channel.send(fullInput);
      return;
    }

    const content = match[1].trim();
    const spamCount = parseInt(match[2]);

    if (spamCount > 100) {
      return message.channel.send("❌ Maksimal 100x spam!").then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });
    }

    const sentMessages = [];

    for (let i = 0; i < spamCount; i++) {
      const sentMsg = await message.channel.send(content);
      sentMessages.push(sentMsg);
    }

    setTimeout(() => {
      sentMessages.forEach((msg) => msg.delete().catch(console.error));
    }, 5000);
  },
};

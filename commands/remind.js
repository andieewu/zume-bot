module.exports = {
  name: "remind",
  description: "Setel pengingat sederhana dalam beberapa detik.",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply("⏰ Format: `!remind <detik> <pesan>`");
    }

    const timeInSeconds = parseInt(args[0]);

    if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
      return message.reply(
        "❌ Waktu harus berupa angka positif (dalam detik)."
      );
    }

    const reminderMessage = args.slice(1).join(" ");

    await message.reply(
      `📌 Pengingat akan dikirim dalam **${timeInSeconds} detik**.`
    );

    setTimeout(() => {
      message.reply(`🔔 **Pengingat:** ${reminderMessage}`);
    }, timeInSeconds * 1000);
  },
};

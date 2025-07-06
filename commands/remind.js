module.exports = {
  name: "remind",
  description: "Setel pengingat. Contoh: !remind 10m Minum air!",
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(
        "Format: `!remind <waktu>s/m/h <pesan>`\nContoh: `!remind 30m Istirahat sejenak!`"
      );
    }

    const timeInput = args[0];
    const reminderMsg = args.slice(1).join(" ");

    const timeUnit = timeInput.slice(-1).toLowerCase();
    const timeValue = parseInt(timeInput.slice(0, -1));

    if (
      isNaN(timeValue) ||
      timeValue < 1 ||
      !["s", "m", "h"].includes(timeUnit)
    ) {
      return message.reply(
        "Format waktu tidak valid.\n" +
          "Gunakan: `angka + satuan` (s=detik, m=menit, h=jam)\n" +
          "Contoh: `5m`, `30s`, `1h`"
      );
    }

    let ms;
    switch (timeUnit) {
      case "s":
        ms = timeValue * 1000;
        break;
      case "m":
        ms = timeValue * 60 * 1000;
        break;
      case "h":
        ms = timeValue * 60 * 60 * 1000;
        break;
    }

    const MAX_DURATION = 7 * 24 * 60 * 60 * 1000;
    if (ms > MAX_DURATION) {
      return message.reply("Maksimal waktu pengingat adalah 7 hari.");
    }

    await message.reply(
      `⏰ Aku akan mengingatkan kamu dalam **${timeValue}${timeUnit}**\n` +
        `Pesan: *"${reminderMsg}"*`
    );

    setTimeout(async () => {
      try {
        await message.author.send(`🔔 **Pengingat**:\n${reminderMsg}`);
      } catch (error) {
        await message.channel.send(
          `🔔 <@${message.author.id}>, **Pengingat**:\n${reminderMsg}`
        );
      }
    }, ms);
  },
};

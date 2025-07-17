const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getTrendingGames } = require("../utils/robloxTrending");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trending-now")
    .setDescription("Lihat game Roblox trending saat ini")
    .addStringOption((option) =>
      option
        .setName("wilayah")
        .setDescription("Pilih wilayah trending")
        .setRequired(false)
        .addChoices(
          { name: "Global", value: "global" },
          { name: "Indonesia", value: "indonesia" }
        )
    ),

  async execute(interaction) {
    const region = interaction.options.getString("wilayah") || "global";

    await interaction.deferReply();

    const games = await getTrendingGames(region);
    if (!games.length) {
      return interaction.editReply(
        "❌ Tidak bisa mengambil game trending saat ini."
      );
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `📈 Game Roblox Trending (${
          region === "global" ? "Global" : "Indonesia"
        })`
      )
      .setColor(0x0099ff)
      .setTimestamp();

    games.forEach((game, i) => {
      embed.addFields({
        name: `#${i + 1} ${game.name}`,
        value: `[Mainkan](${game.url}) | 👥 ${game.players} | ⭐ ${game.rating}`,
      });
    });

    await interaction.editReply({ embeds: [embed] });
  },
};

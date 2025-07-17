const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getTrendingGames } = require("../utils/robloxTrending");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trending")
    .setDescription("Lihat game Roblox yang sedang trending")
    .addStringOption((option) =>
      option
        .setName("wilayah")
        .setDescription("Pilih wilayah game yang ingin ditampilkan")
        .setRequired(false)
        .addChoices(
          { name: "Global", value: "global" },
          { name: "Indonesia", value: "indonesia" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const wilayah = interaction.options.getString("wilayah") || "global";
    const games = await getTrendingGames(wilayah);

    if (games.length === 0) {
      return interaction.editReply(
        `Tidak ada game trending yang ditemukan untuk wilayah **${wilayah}**.`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `🔥 Game Trending Roblox (${
          wilayah === "global" ? "Global" : "Indonesia"
        })`
      )
      .setColor("#00ccff")
      .setTimestamp();

    games.forEach((game, index) => {
      embed.addFields({
        name: `#${index + 1} ${game.name}`,
        value: `[Mainkan Game](${game.url})\n👥 Pemain Aktif: ${game.players} | ⭐ Rating: ${game.rating}`,
      });
    });

    interaction.editReply({ embeds: [embed] });
  },
};

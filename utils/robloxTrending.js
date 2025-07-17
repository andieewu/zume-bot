const axios = require("axios");
const cheerio = require("cheerio");

const TRENDING_URLS = {
  global: "https://www.roblox.com/discover#/sortName=mostPopular&type=games",
  indonesia: "https://www.roblox.com/discover?Keyword=indonesia",
};

async function getTrendingGames(region = "global", maxResults = 10) {
  const url = TRENDING_URLS[region] || TRENDING_URLS.global;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const gameScripts = $("script")
      .toArray()
      .map((s) => $(s).html())
      .find((t) => t && t.includes("universeId"));

    const games = [];
    const regex =
      /"name":"(.*?)".*?"creatorName":"(.*?)".*?"universeId":(\d+).*?"price":(null|\d+).*?"absoluteUrl":"(.*?)".*?"totalUpVotes":(\d+).*?"totalDownVotes":(\d+).*?"playing":(\d+)/g;

    let match;
    while (
      (match = regex.exec(gameScripts)) !== null &&
      games.length < maxResults
    ) {
      const [
        _,
        name,
        creator,
        universeId,
        price,
        url,
        upVotes,
        downVotes,
        players,
      ] = match;

      const totalVotes = Number(upVotes) + Number(downVotes);
      const rating =
        totalVotes > 0
          ? `${Math.round((Number(upVotes) / totalVotes) * 100)}%`
          : "N/A";

      games.push({
        name,
        creator,
        id: universeId,
        price,
        url: url.startsWith("http") ? url : `https://www.roblox.com${url}`,
        rating,
        players: parseInt(players).toLocaleString("id-ID"),
      });
    }

    return games;
  } catch (err) {
    console.warn(
      `❌ Gagal ambil trending games untuk region "${region}":`,
      err.message
    );
    return [];
  }
}

module.exports = { getTrendingGames };

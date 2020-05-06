const cheerio = require("cheerio");
const request = require("request");

function generateLyrics(body) {
  let $ = cheerio.load(body);
  return $(".lyrics").text();
}

exports.getLyrics = (req, res1, next) => {
  request(
    {
      method: "GET",
      uri: req.body.url,
    },
    (err, res2, body) => {
      if (err) throw err;

      const lyrics = generateLyrics(body);

      res1.status(200).json({ lyrics });
    }
  );
};

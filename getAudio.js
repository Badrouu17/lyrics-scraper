const ytdl = require("ytdl-core");

exports.getAudio = (req, res, next) => {
  const audioUrl = "https://www.youtube.com/watch?v=" + req.params.Vid;
  try {
    var audioReadableStream = ytdl(audioUrl, {
      filter: "audioonly",
      quality: "lowestaudio",
    });

    audioReadableStream.pipe(res);
  } catch (e) {
    console.log("🔥", e);
    res.end("Error");
  }
};

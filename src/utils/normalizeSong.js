export function normalizeSong(rawSong) {
  return {
    trackId: rawSong.trackId,
    title: rawSong.title?.trim(),

    artists: rawSong.artist?.split(",").map((a) => a.trim()),

    genre: rawSong.genre,
    mp3: rawSong.mp3,
    cover: rawSong.cover,
  };
}

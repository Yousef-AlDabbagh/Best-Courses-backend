exports.parseData = (req, res, next) => {
  const { trailer, team, genres, tags } = req.body;

  if (trailer) req.body.trailer = JSON.parse(trailer);
  if (team) req.body.team = JSON.parse(team);
  if (genres) req.body.genres = JSON.parse(genres);
  if (tags) req.body.tags = JSON.parse(tags);

  next();
};

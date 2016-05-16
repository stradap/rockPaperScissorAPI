var express = require("express"),
	chmpRouter = express.Router();



var routes = function(champion, plGame, hst , multer) {
	chmpRouter.route('/top')
		.post(function(req, res) {
			//extractGames(req.body);
			var player = new plGame(req.body);
			player.save();
			res.status(201).send(player);
		})
		.get(function(req, res) {
			plGame.find(function(err, players) {
				if (err)
					res.status(500).send('error test:' + err);
				else {
					res.json(players);
				}
			});
		});
	//Receives the championship data and computes it to identify the winner. The first and second place are stored into a database with their respective scores. Returns the winner of the championship.
	chmpRouter.route('/new')
		.post(function(req, res , next) {
			var result = '';
			multer()(req, res, next);
			return result;
		})
		.get(function(req, res) {

		});
	return chmpRouter;
};

module.exports = routes;

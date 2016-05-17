var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	db = mongoose.connect('mongodb://127.0.0.1/chmpAPI'),
	champion = require('./models/championModel'),
	plGame = require("./models/playerModel"),
	hst = require("./models/historyModel"),
	api = express(),
	port = process.env.PORT || 3000,
	multer = require('multer');
var chmpRouter = express.Router();
var algorithm = require('./algorithm');

String.prototype.equalsIgnoreCase = function(otherString) {
	return (this.toUpperCase() == otherString.toUpperCase());
}
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies

api.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var storage = multer.diskStorage({
	//Store champs files as reference of other examples
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({
	storage: storage
}).single('champFile');

//
api.post('/api/championship/new', function(req, res) {
	upload(req, res, function(err) {
		if (err) {
			return res.end("Error uploading file.");
		}
		var result = algorithm.extractGames(req.file.path);
		var data = algorithm.championship(result);
		var firstSecond = data.split(",");
		var save = algorithm.saveHistory(data, plGame = require("./models/playerModel"));
		res.end("The winner of the tournament is: " + firstSecond[0] + "," + firstSecond[1] + " and all the data was storage");
	});
});

/*Stores the first and second place of a tournament, each user is stored with their respective scores. 
The user names will be unique, but the same user can win 1 or more championships. 
Returns the operation status if successfully.*/
api.post('/api/championship/result', function(req, res) {
	var firstWinner = "";
	var secondWinner = "";
	if (req.body.first) {
		firstWinner = req.body.first;
	}
	if (req.body.second) {
		secondWinner = req.body.second;
	}
	if (firstWinner && secondWinner) {
		algorithm.saveToHistory(firstWinner, secondWinner, plGame);
		res.end("success");
	}
	else {
		res.end("fail");
	}
});

//Retrieves the top players of all championships. Returns the list of player names based on the count provided. By default 10
api.get('/api/championship/top/', function(req, res) {
	var count = 10;
	if (req.query.count) {
		count = req.query.count;
	}
	var result = algorithm.getTop(count, plGame);

	result.then(function(data) {
		data = data.map(function(user) {
			return user.namePlayer;

		});
		var result = data;
		res.send(result);
	});
});

api.get('/', function(req, res) {
	res.send('welcome to API.... here is a list of available methods : ');
});

//Start the API process
api.listen(port, function() {
	console.log('Running on port: ' + port);
})

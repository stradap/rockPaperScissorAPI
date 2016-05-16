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
var Hashtable = require('jshashtable');
var chmpRouter = express.Router();
var fs = require('fs');
var fileToRead = "";
var algorithm = require('./algorithm');

String.prototype.equalsIgnoreCase = function(otherString) {
    return (this.toUpperCase() == otherString.toUpperCase()) ;
}
api.use(bodyParser.json());

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

api.post('/api/championship/new', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        var result = algorithm.extractGames(req.file.path);
        var data = algorithm.campeonato(result);
        var firstSecond = data.split(",");
        res.end("The winner of the tournament is: " + firstSecond[0] + "," + firstSecond[1]);
    });
});

api.get('/', function(req, res) {
    res.send('welcome to API.... here is a list of available methods : ');
});

//Start the API process
api.listen(port, function() {
    console.log('Running on port: ' + port);
})


		var Hashtable = require('jshashtable');
		var fs = require('fs');
		module.exports = {
			extractGames: function(tournament) {
				var dataResult = fs.readFileSync(tournament).toString("utf-8");
				var match_list = new Array();
				var tournament = dataResult.replace(/\s/g, "");
				var torneo = tournament.split(","); //Lo divido en userName - Move  
				var counter = torneo[0].split("\[").length - 1; //cuento los brakets de apertura para averiguar la profundidad
				var linea = "";
				var i = 0;
				while (i < torneo.length - 2) {
					if (i < 3) {
						linea = torneo[0].substring((counter - 2), torneo[0].length - 1) + ", " + torneo[1] + ", " + torneo[2] + ", " + torneo[3];
						match_list.push(linea);
					}
					else {
						linea = torneo[i].substring(torneo[i].indexOf("\"") - 2, torneo[i].length) + ", " + torneo[i + 1] + ", " + torneo[i + 2] + ", " + torneo[i + 3].substring(0, torneo[i + 3].indexOf("\"") + 5);
						match_list.push(linea);
					}
					i = i + 4;
				}
				return match_list;
			},
			solveGame: function(game, final) {
				//a.1 
				//Tabla con los resultados posibles en una tabla de hash, (0 -> gana el primero)-(1 ->gana el segundo)
				var match_map = new Hashtable();
				match_map.put("SS", 0);
				match_map.put("SR", 1);
				match_map.put("SP", 0);
				match_map.put("RR", 0);
				match_map.put("RS", 0);
				match_map.put("RP", 1);
				match_map.put("PP", 0);
				match_map.put("PS", 1);
				match_map.put("PR", 0);
				game = game.replace(/\s/g, "");
				try {
					if (game.split(",").length % 2 != 0) {
						throw new Error("Exception levantada! El número de jugadores debe ser igual a dos!");
					}
				}
				catch (err) {
					console.error("Error", err.message);
				}
				//a.2
				try {
					var game_ = game.split(",");
					//Revisión de la estrategia case insensitive, un false se propaga debido al AND && y fuerza el else
					if ((game_[1].substring(1, 2).equalsIgnoreCase("S") || game_[1].substring(1, 2).equalsIgnoreCase("R") || game_[1].substring(1, 2).equalsIgnoreCase("P")) && (game_[3].substring(1, 2).equalsIgnoreCase("S") || game_[3].substring(1, 2).equalsIgnoreCase("R") || game_[3].substring(1, 2).equalsIgnoreCase("P"))) {
						console.log("Estrategia bien formada");
					}
					else {
						throw new Error("Exception levantada! Estrategia mal formada!");
					}
				}
				catch (err) {
					console.error("Error", err.message);
				}
				//a.3
				var winner = 0;
				var game_ = game.split(",");

				//Se usa ambas estrategias para sacar la ganadora según la tabla de hash
				winner = match_map.get(game_[1].substring(1, 2) + game_[3].substring(1, 2));
				var result = "";
				if (winner == 0) {
					result = game_[0].substring(1, game_[0].length) + ", " + game_[1];
				}
				else {
					result = game_[2] + ", " + game_[3].substring(0, game_[3].length - 1);
				}

				if (final) {
					if (winner == 0) {
						result = game_[0].substring(1, game_[0].length) + ", " + game_[1] + ", " + game_[2] + "," + game_[3].substring(0, game_[3].length - 1);
					}
					else {
						result = game_[2] + ", " + game_[3].substring(0, game_[3].length - 1) + ", " + game_[0].substring(1, game_[0].length) + ", " + game_[1];
					}
				}
				return result;
			},
			championship: function(champ) {
				var resultado = "";
				//determinacion del tamaño de la tabla final

				//la tabla crece de manera que empezando con n encuentros, por cada ronda k hay que agregar n/(2^k)-1 encuentros a la tabla
				//esto me da el limite superior a la hora de recorrerla y el resultado se obtiene solucionando el juego que está
				//en la ultima fila de la lista "champ" que contiene el campeonato completo 
				var size_op = champ.length;
				var final_size = size_op;
				while (size_op % 2 == 0) {
					size_op = size_op / 2;
					final_size = final_size + size_op;
				}
				console.log("El torneo tendrá: " + final_size + " competencias!");
				/// Iteración y sobre la lista, esta va a crecer en tanto se van realizando los encuentros, se itera hasta final_size
				var k = 0;
				while (k < final_size - 1) {
					//Cada nuevo nuevo encuentro resultado del ganador de dos juegos consecutivos en la tabla de partidas "champ"
					champ.push("[" + this.solveGame(champ[k]) + "," + this.solveGame(champ[k + 1]) + "]");
					k = k + 2;
				}
				var n = 0;
				console.log("Campeonato completo! historial de partidas: ");
				while (n < final_size) {
					console.log(champ[n]);
					n++;
				}
				//solucionando el último juego de la tabla se obtiene el ganador del torneo!
				var champFinal = champ;
				var winnerTournamet = this.solveGame(champFinal[final_size - 1], true);
				var firstSecond = winnerTournamet.split(",");
				console.log("Second place:" + firstSecond[2] + "," + firstSecond[3]);
				console.log("First place: " + firstSecond[0] + "," + firstSecond[1]);
				return winnerTournamet;
			},
			saveHistory: function(data, plGame) {
				data = data.replace(/\s/g, "");
				var firstSecond = data.split(",");
				var first = firstSecond[0].replace(/(")*(\[)*/g, "");
				var second = firstSecond[2].replace(/(")*(\[)*/g, "");

			/*	var winner1 = new plGame({
					namePlayer: first,
					score: 0
				}).save();
				var winner2 = new plGame({
					namePlayer: second,
					score: 0
				}).save();*/
					plGame.findOneAndUpdate({
					namePlayer: first
				}, {
					$inc: {
						"score": 3
					}
				}, function(err, user) {
					if (err) {
						throw err;
					}
					else {
						if (!user) {
							var winner1 = new plGame({
								namePlayer: first,
								score: 3
							}).save();
						}
					}
				});
				plGame.findOneAndUpdate({
					namePlayer: second
				}, {
					$inc: {
						"score": 1
					}
				}, function(err, user) {
					if (err) {
						throw err;
					}
					else {
						if (!user) {
							var winner1 = new plGame({
								namePlayer: second,
								score: 1
							}).save();
						}
					}
				});

				return true;
			},
			//Find 
			saveToHistory: function(first, second, plGame) {
				plGame.findOneAndUpdate({
					namePlayer: first
				}, {
					$inc: {
						"score": 3
					}
				}, function(err, user) {
					if (err) {
						throw err;
					}
					else {
						if (!user) {
							var winner1 = new plGame({
								namePlayer: first,
								score: 3
							}).save();
						}
					}
				});
				plGame.findOneAndUpdate({
					namePlayer: second
				}, {
					$inc: {
						"score": 1
					}
				}, function(err, user) {
					if (err) {
						throw err;
					}
					else {
						if (!user) {
							var winner1 = new plGame({
								namePlayer: second,
								score: 1
							}).save();
						}
					}
				});
			}
		};
const jwt = require('jsonwebtoken');
const redis = require("redis");
const client = redis.createClient();
const passport = require("passport");

client.on("error", function(error) {
	console.error(error);
});

function createToken(user) {
    return jwt.sign({id: user.id, username: user.username}, "My so secret sentence");
}

function signin(req, res) {
    let User = require('../models/user');
	User.findOne({username: req.body.account}, function(err, user) {
		if (err)
			throw err;

		if (user.comparePassword(req.body.password)) {
            req.session.username = req.body.account;
			req.session.logged = true;
			let t = createToken(user);
			console.log("Le token est : ", t);
			res.status(200).json({token: t});
		}
		else
			res.redirect('/');
	});
}

function signup(req, res) {

    let User = require('../models/user');
	let user = new User();

	user.username = req.body.account;
	user.password = req.body.password;

	user.save((err, savedUser) => {

		if (err)
			throw err;

		res.redirect('/');

	});
}

function signout(req, res) {

    req.session.username = "";
	req.session.logged = false;
    res.redirect("/");

}


// Fonction pour redis
function verificationTokenRedis(t){
	return client.exists(t);
}



function data(req, res) {
	// Si une session est en cours
	if(req.session.logged){
		const tokenbis = req.header('Authorization')
		const token = req.header('Authorization').replace('Bearer ', '')
		console.log('===========================');

		// Si le token est bon.
		try{
			const payload = jwt.verify(token,  "My so secret sentence")
			console.log("Token Validée")
			// REDIS Début
			client.exists(tokenbis, function(err, data){
				// Si le token n'est pas dans la base donc init
                if (data === 0){
                    client.set(tokenbis, 0);
					client.expire(tokenbis, 600);
					console.log("Accès aux données validée")
                    res.status(200).send("Voici les données");
				}

				// si le token est dans la base
                else {
					client.get(tokenbis, function(err, val){
						// Nous vérifions la valeur de token
						if (val < 10){
							client.incr(tokenbis);
							client.ttl(tokenbis, redis.print);
							client.get(tokenbis, redis.print);
							console.log("Accès aux données validée")
							res.status(200).send("Voici les données");
						}
						else{
							console.log("Accès aux données refusée")
							res.status(401).send("Trop de requete en 10min");
						}
                })
            }});

		// Si le token n'est pas ok
		} catch(error) {
			res.status(403).send('Token non valide');
			console.error(error.message);
		}

	}
	// Si la personne n'est pas connectée
	else {
		res.status(403).send('Merci de vous co')
	}

}


module.exports.signin = signin;
module.exports.signup = signup;
module.exports.signout = signout;
module.exports.data = data;
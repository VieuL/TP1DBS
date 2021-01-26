const jwt = require('jsonwebtoken');
const redis = require("redis");
const client = redis.createClient();
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
			console.log(t);
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

function profile(req, res) {

	console.log(req.session.logged)
    if (req.session.logged)
        res.send("Bonjour");
    else
        res.redirect('/');

}


// Fonction pour redis
function verificationTokenRedis(t){

	return client.get(t);
}

function creationRedis(t){

	client.set(t,'1')
	// Ajout du ttl
	client.expire(t, 600);


}




function data(req, res) {
	if(req.session.logged){
		const tokenbis = req.header('Authorization')
		const token = req.header('Authorization').replace('Bearer ', '')
		console.log('=========================== \n');
		console.log('Début de la fonction data \n')

		// Si le token est ok
		try{
			const payload = jwt.verify(token,  "My so secret sentence")
			console.log("Validée")

			console.log('Ma rep est :', verificationTokenRedis(tokenbis))
			// REDIS Début
			if(verificationTokenRedis(tokenbis) != false){
				console.log("Cas 1 : ")

				//Incrémentation de la valeur et vérification de la valeur
				client.get(tokenbis, function(err, value) {
					if (err) throw err;
					if(value < 10) {
						client.incr(tokenbis);
						console.log("Je suis moins de 10", value);
						res.send('Voila les données');
					}
					else {
						console.log("Trop d'utilisation pour le TOKEN en question, ", value)
						res.send('trop de requette att 10min');
					}
				  });

				// Le token est deja présent dans la base de données
			} else {
				console.log("Cas 2 : ")
				// Création du token dans la base de données
				creationRedis(tokenbis);
			}


		// Si le token n'est pas ok
		} catch(error) {
			res.send('Token non valide');
			console.error(error.message);
			console.log("Courage")
		}

	} else {
		res.send('Merci de vous co')
	}


}

module.exports.signin = signin;
module.exports.signup = signup;
module.exports.signout = signout;
module.exports.profile = profile;
module.exports.data = data;
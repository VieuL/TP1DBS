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
	return client.exists(t);
}



function data(req, res) {
	if(req.session.logged){
		const tokenbis = req.header('Authorization')
		const token = req.header('Authorization').replace('Bearer ', '')
		console.log('=========================== \n');
		console.log('Début de la fonction data \n')

		// Si le token est bon.
		try{
			const payload = jwt.verify(token,  "My so secret sentence")
			console.log("Validée")
			const check = verificationTokenRedis(tokenbis);
			console.log(check)
			// REDIS Début
			client.exists(tokenbis, function(err, data){

				// Si le token n'est pas dans la base donc init
                if (data === 0){
                    client.set(tokenbis, 0);
                    client.expire(tokenbis, 600);
                    res.send("Voici les données");
				}

				// si le token est dans la base
                else {
					client.get(tokenbis, function(err, val){
						// Nous vérifions la valeur de token
						if (val < 10){
							client.incr(tokenbis);
							client.ttl(tokenbis, redis.print);
							client.get(tokenbis, redis.print);
							res.send("Voici les données");
						}
						else{
							res.send("Trop de requete en 10min");
						}
                })
            }});

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
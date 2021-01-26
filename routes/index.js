let router = require('express').Router();
let controller = require("../controllers");
const passport = require("passport");

router.post('/signin', function(req, res) {

  controller.signin(req, res);

});


router.post('/signout', function(req, res) {

    controller.signout(req, res);

});

router.post('/signup', function(req, res) {

	controller.signup(req, res);

});

router.get('/profile', passport.authenticate('jwt', { session: false }), function(req, res) {

	controller.profile(req, res);

});

router.get('/data', function(req, res) {

	controller.data(req, res);

})

module.exports = router;

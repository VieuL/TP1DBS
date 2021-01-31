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

// passport.authenticate('jwt', { session: false }),
router.get('/read_data', function(req, res) {
	controller.data(req, res);
})

module.exports = router;

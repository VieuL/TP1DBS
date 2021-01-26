//Access the router on Express 
const router = require('express').Router();

//Access the controllers
const controller = require('../controllers/todo');


//READ
router.get('/todos', (req, res) => {
    controller.reads(req, res);
});


module.exports = router;
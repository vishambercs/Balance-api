var express                             = require('express');
var router                              = express.Router();
const indexcontroller                   = require('../controllers/indexcontroller');

router.post('/getBalance',                 indexcontroller.getBalance);
router.post('/create_or_update_network',    indexcontroller.create_or_update_network);
router.get('/allNetworks',    indexcontroller.all_networks);

module.exports = router;

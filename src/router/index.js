let express = require('express');
let router = express.Router();
 
const URLController = require('../controllers');

router.get('/api', async (req, res) => { return res.status(201).send("Welcome to Short URL API"); });
router.post('/api/urlshort/submit', URLController.CreateShortURLCode);
router.get('/api/urlshort/:shortcode', URLController.RedirectToWebsite);
router.get('/api/urlshort/:shortcode/stats', URLController.GetShortCodeStats);

module.exports = router;
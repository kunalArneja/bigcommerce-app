const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
secret: '60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668',
responseType: 'json'
});

router.get('/', (req, res, next) => {
try {
const data = bigCommerce.verify(req.query['signed_payload']);
console.log(data);
res.render('welcome', { title: 'Welcome!'});
} catch (err) {
next(err);
}
});

module.exports = router;
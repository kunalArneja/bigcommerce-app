const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
clientId: 'd9nnt8i14fn9werfbrmygr4ttqe0brk',
secret: '60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668',
callback: 'https://bc59c612273b.ngrok.io/auth',
responseType: 'json'
});

router.get('/', (req, res, next) => {
    //todo save access token
bigCommerce.authorize(req.query)
.then(
    data => req.getConnection((err, conn) => {
        conn.query('INSERT INTO bc_retailer (store_hash, access_token) VALUES ( ? , ?)', [data.context.replace("stores/", ""), data.access_token], (err, bc_retailer_new) => {
            res.render('auth', { title: 'Authorized!' });
        })
    })
)
});
module.exports = router;
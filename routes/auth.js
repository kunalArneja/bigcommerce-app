const express = require('express'),
    router = express.Router(),
    BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
    clientId: 'd9nnt8i14fn9werfbrmygr4ttqe0brk',
    secret: '60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668',
    callback: 'https://6adde1736c3f.ngrok.io/auth',
    responseType: 'json'
});

router.get('/', (req, res, next) => {
    //todo save access token
    bigCommerce.authorize(req.query)
        .then(
            data => req.getConnection((err, conn) => {
                conn.query("SELECT * FROM bc_retailer WHERE store_hash = ?", [data.context.replace("stores/", "")], (err, rows) => {
                    console.log(rows);
                    if (rows && rows.length > 0) {
                        conn.query("DELETE FROM bc_retailer WHERE store_hash = ?", [data.context.replace("stores/", "")]);
                    }
                })
                conn.query('INSERT INTO bc_retailer (store_hash, access_token, status) VALUES ( ? , ?, ?)', [data.context.replace("stores/", ""), data.access_token, 'AUTHORIZED'], (err, bc_retailer_new) => {
                    res.render('auth', { title: 'Authorized!' });
                })
            })
        )
});
module.exports = router;
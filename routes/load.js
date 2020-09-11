const express = require('express'),
    router = express.Router(),
    BigCommerce = require('node-bigcommerce'),
    Hub = require('../controllers/hub');;

const bigCommerce = new BigCommerce({
    secret: '60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668',
    responseType: 'json'
});
const hub = new Hub();

router.get('/', (req, res, next) => {
    try {
        const data = bigCommerce.verify(req.query['signed_payload']);
        console.log(data);
        email = data.owner.email;
        storeHash = data.store_hash;

        try {
            req.getConnection((err, conn) => {
                conn.query("SELECT * FROM bc_retailer WHERE store_hash = ?", [storeHash], (err, rows) => {
                    console.log(rows);
                    if (rows && rows.length > 0 && rows[0].status == 'INSTALLED') {
                        res.redirect('https://hubn-qa01.narvar.qa')
                    } else {
                        res.render('add_retailer', { signed_payload: req.query['signed_payload'] });
                    }
                })
            });
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    }
});

router.post('/', (req, res, next) => {
    try {
        const data = bigCommerce.verify(req.query['signed_payload']);
        console.log(req.body);
        console.log(data);
        hub.getAccessToken()
            .then(token => hub.getJsessionId(token)
                .then(jsessionId => hub.addTenant(data.owner.email, req.body.retailer_moniker, data.store_hash, jsessionId)
                    .then(jsessionId => hub.saveBigCommerceCredentials(data, data, jsessionId)
                        .then(
                            req.getConnection((err, conn) => {
                                conn.query('UPDATE bc_retailer set retailer_moniker = ?, email = ?, status = ? WHERE store_hash = ?',
                                    [req.body.retailer_moniker, data.owner.email, 'INSTALLED', data.store_hash], (err, bc_retailer_new) => {
                                        console.log(bc_retailer_new);
                                        res.redirect('/load?signed_payload=' + req.query['signed_payload']);
                                    })
                            })))));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
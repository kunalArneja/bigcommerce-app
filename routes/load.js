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
                        hub.getAccessToken(rows[0].hub_email, rows[0].hub_password)
                            .then(token => hub.getCookies(token)
                                .then(cookies => res.render('redirect', { cookie: cookies })
                                ))
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
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM bc_retailer WHERE store_hash = ?", [storeHash], (err, rows) => {
                console.log(rows);
                if (rows && rows.length > 0) {
                    hub.getAccessToken('kunal.arneja@narvar.com', 'Hub@2020')
                        .then(token => hub.getJsessionId(token)
                            .then(jsessionId => hub.addTenant(req.body.retailer_moniker, data.store_hash, jsessionId)
                                .then(response => hub.saveBigCommerceCredentials(req.body.retailer_moniker, rows[0].access_token, rows[0].store_hash, jsessionId)
                                    .then(response => hub.createManagerUser(req.body.first_name, req.body.last_name, req.body.email, req.body.retailer_moniker, jsessionId)
                                        .then(response => hub.getUserIdByEmail(req.body.email, token)
                                            .then(userId => hub.setUserPassword(userId, req.body.password, token)
                                                .then(
                                                    conn.query('UPDATE bc_retailer set retailer_moniker = ?, email = ?, hub_email = ?, hub_password = ?, status = ? WHERE store_hash = ?',
                                                        [req.body.retailer_moniker, data.owner.email, req.body.email, req.body.password, 'INSTALLED', data.store_hash], (err, bc_retailer_new) => {
                                                            console.log(bc_retailer_new);
                                                            res.redirect('/load?signed_payload=' + req.query['signed_payload']);
                                                        })
                                                )))))))
                };
            })
        })

    } catch (err) {
        next(err);
    }
});

module.exports = router;
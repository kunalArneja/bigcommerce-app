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
        email = data.user.email;
        store_hash = data.store_hash;

        try {
            req.getConnection((err, conn) => {
                conn.query("SELECT * FROM bc_retailer WHERE store_hash = ?", [store_hash], (err, rows) => {
                    console.log(rows);
                    hub.getAccessToken().then(token => load(token, rows, req, res));
                })        
            });
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    }
});

function load(token, rows, req, res){
    console.log(token);
    if (rows && rows.length > 0 && rows[0].retailer_moniker) {
        res.render('welcome', { name: rows[0].retailer_moniker});
    } else{
        res.render('add_retailer', {signed_payload : req.query['signed_payload']});
    }
}

router.post('/', (req, res, next) => {
    try {
        const data = bigCommerce.verify(req.query['signed_payload']);
        console.log(req.body);
        console.log(data);

        req.getConnection((err, conn) => {
            conn.query('UPDATE bc_retailer set retailer_moniker = ?, email = ? WHERE store_hash = ?', [req.body.retailer_moniker, data.owner.email, data.store_hash], (err, bc_retailer_new) => {
                console.log(bc_retailer_new);
                res.redirect('/load?signed_payload='+req.query['signed_payload']);
            })
        })
    } catch (err) {
        next(err);
    }
});

module.exports = router;
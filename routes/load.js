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
        email = data.user.email;
        store_hash = data.store_hash;

        try {
            req.getConnection((err, conn) => {
                conn.query("SELECT * FROM bc_retailer WHERE store_hash = ?", [store_hash], (err, rows) => {
                    console.log(rows);
                    if (rows && rows.length > 0) {
                        res.render('welcome', { name: rows[0].retailer_moniker});
                    } else{
                        res.render('add_retailer', {signed_payload : req.query['signed_payload']});
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
    
        var bc_retailer = {email : data.owner.email, store_hash: data.store_hash, retailer_moniker: req.body.retailer_moniker};
        
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO bc_retailer set ?', bc_retailer, (err, bc_retailer_new) => {
                console.log(bc_retailer_new);
                res.redirect('/load?signed_payload='+req.query['signed_payload']);
            })
        })
    } catch (err) {
        next(err);
    }
});

module.exports = router;
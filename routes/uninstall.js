const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
secret: '60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668',
responseType: 'json'
});

router.get('/', (req, next) => {
try {
    const data = bigCommerce.verify(req.query['signed_payload']);
    console.log(data);
    store_hash = data.store_hash;
    req.getConnection((err, conn) => {
        conn.query("DELETE FROM bc_retailer WHERE store_hash = ?", [store_hash]);
    });
    //todo uninstall
   
} catch (err) {
next(err);
}
});

module.exports = router;
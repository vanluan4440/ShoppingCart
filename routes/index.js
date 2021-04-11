var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const Products = require('../models/data');
const Cart = require('../models/cart');
const Acount = require('../models/acount')
const { render, name } = require('ejs');
DataUser = [];



function getTodos(res) {
    Products.find(function(err, product) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(product); // return all todos in JSON format
    });
};
router.get('/api/product', function(req, res) {
    // use mongoose to get all todos in the database
    getTodos(res);
});
/* GET home page. */
router.get('/home', function(req, res, next) {
    res.render('index', { DataUser });
});
router.get('/', function(req, res, next) {
    Products.find({}, (err, product) => {
        res.render('index', { product });
    })

});

router.get('/listProduct', function(req, res, next) {
    res.render('list')
});

router.get('/admin', function(req, res, next) {
    res.render('admin')
});

router.post('/post', function(req, res, next) {
    var product = new Products(req.body)
    product.save(err => {
        res.render('admin')
    })
});
router.get('/delete/:id', function(req, res) {
    Products.deleteOne({ _id: req.params.id },
        (error => res.redirect('/listProduct'))
    );
});
/*Edit product */
router.get('/edit/:id', async(req, res) => {
    try {
        const data = await Products.findById(req.params.id)
        res.render('edit', { data });
    } catch {
        res.redirect('/listProduct')
    }
});
router.post('/edit/:id', async(req, res) => {
    let data
    try {
        data = await Products.findById(req.params.id)
        data.name = req.body.name
        data.description = req.body.description
        data.type = req.body.type
        data.price = req.body.price
        data.img = req.body.img
        await data.save()
        res.redirect('/listProduct')

    } catch {
        if (data |= null) {
            res.redirect('/')
        }

    }
});
/*Add product in cart  <%=data.description%>*/
router.post('/add/:id/:name/:price/:img/:description', async(req, res) => {
    const data = await Cart.findById(req.params.id)
    if (data == null) {
        var card = new Cart()
        card._id = req.params.id
        card.name = req.params.name
        card.price = req.params.price
        card.description = req.params.description
        card.img = req.params.img
        card.qty = req.body.qty
        await card.save()
        res.redirect('/cart')
    } else {
        data.qty += 1
        await data.save()
        res.redirect('/cart')
    }

})

/*Login */
router.get('/login', function(req, res, next) {
    res.render('login')
});
/*CHi tiet san pham */
router.get('/chitiet/:id', async(req, res) => {
    try {
        const data = await Products.findById(req.params.id)
        res.render('chitiet', { data });
    } catch {
        res.redirect('/')
    }
});
/*acount */
router.get('/signup', function(req, res, next) {
    res.render('acount')
});



/*Cart */
router.get('/deleteCart/:id', function(req, res) {
    Cart.deleteOne({ _id: req.params.id },
        (error => res.redirect('/cart'))
    );
});

router.get('/cart', function(req, res, next) {
    res.render('cart')
});
/*Pay */
router.get('/pay', function(req, res, next) {
    Cart.find({}, (err, data) => {
        res.render('pay', { data });
    })
});
/*gio hang get */
function getCart(res) {
    Cart.find(function(err, product) {
        if (err) {
            res.send(err);
        }

        res.json(product);
    });
};
router.get('/api/cart', function(req, res) {

    getCart(res);
});
/*creat acount */
router.post('/login', function(req, res, next) {
    Acount.findOne({ email: req.body.email }, function(err, user) {
        if (user === null) {
            return res.status(400).send({
                message: "User not found."
            });
        } else {
            var mykey = crypto.createDecipher('aes-128-cbc', 'password');
            var mystr = mykey.update(user.pass, 'hex', 'utf8')
            mystr += mykey.final('utf8');
            console.log(mystr)
            if (String(mystr) == String(req.body.pass)) {
                DataUser.splice(0, 3);
                DataUser.push(user.name)

                console.log(DataUser)
                res.render('index', { DataUser })
            } else {
                return res.status(400).send({
                    message: "Wrong Password"
                });
            }
        }
    });
});
router.get('/logout', function(req, res, next) {
    DataUser.splice(0, 3);
    DataUser.push('')
    console.log(DataUser)
    res.render('index', { DataUser })
});
router.post('/signup', (req, res, next) => {
    // Creating empty user object 
    Acount.findOne({ email: req.body.email }, function(err, user) {
        if (user === null) {
            var mykey = crypto.createCipher('aes-128-cbc', 'password');
            var mystr = mykey.update(req.body.pass, 'utf8', 'hex')
            mystr += mykey.final('hex');
            let newUser = new Acount();
            // Initialize newUser object with request data 
            newUser.email = req.body.email,
                newUser.pass = mystr,
                newUser.name = req.body.name
                // Call setPassword function to hash password 

            // Save newUser object to database 
            newUser.save((err) => {
                if (err) {
                    return res.status(400).send({
                        message: "Failed to add user."
                    });
                } else {
                    res.redirect('/login')
                }
            });
        } else {
            res.send('YOu have acount')
        }
    });

});



module.exports = router;
const db = require("mongoose");
db.connect("mongodb://localhost:27017/Data_product", { useNewUrlParser: true, useUnifiedTopology: true });
const cart = db.Schema({
    img: String,
    name: String,
    price: Number,
    description: String,
    createAt: {
        type: Date,
        default: new Date()
    },
    qty: {
        type: Number,
        default: 1,
    }

});
const Cart = db.model('Cart', cart)
module.exports = Cart
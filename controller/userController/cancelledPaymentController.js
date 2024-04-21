const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AX5fcandM_opUkzH-7B0N8FJeY7awBX_tNau7wbqJO5fTNMPOYHqImN2cGZ9T04wj7Wq99evpGnne66r',
    'client_secret': 'ENICeukRb1vfgmDfMVF4AUikC44J102ReBewE6mXSWdLDZTBsd8_s9mUn9Jpt3Za3WcbrnK83_ZpEPnG'
});


exports.cancelledPayment = async (req, res) => {
    try {
        let orderData = req.session.orderData
        let cart = req.query.cart
        // Fetch user and cart details from the database
        let userCart = await Cart.findById(cart);
        let { products } = userCart;
        let items = products;




        let orderItems = orderData.items.map(item => {
            return {
                ...item,
                status: 'Pending Payment'
            };
        });

        let order = new Order({
            userId: orderData.userId,
            username: orderData.username,
            email: orderData.email,
            shippingAddress: orderData.shippingAddress,
            items: orderItems,
            totalAmount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod,

        })

        await order.save()

        delete req.session.orderData
        await Cart.deleteOne({ _id: cart });
        for (let i = 0; i < items.length; i++) {
            await Product.updateOne(
                { _id: items[i].productId },
                { $inc: { quantity: -items[i].cartQty } }
            );
        }
        
        res.render('Users/cancelledPayment')
    } catch (error) {
        console.log(error);
        res.render('Users/404error')
    }
}


exports.quickPayment = async (req, res) => {
    try {
        let couponRate = req.session.couponRate
        const { cartPrice, cartQty, itemId } = req.body
        let amount = cartPrice * cartQty   
        amount = Math.floor(amount - (amount * couponRate / 100))
        amount+=cartQty*40
        const paypalPayment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://www.thethirdeye.shop/user/successQuickPayment?itemId=${itemId}`, 
                "cancel_url": `http://www.thethirdeye.shop/user/orders`    // Your cancel URL
            },
            "transactions": [{
                "amount": {
                    "total": amount,
                    "currency": "USD"
                },
                "description": "Your purchase description goes here."
            }]
        };

        // Create PayPal payment
        paypal.payment.create(paypalPayment, async function (error, payment) {
            if (error) {
                console.error(error);
                return res.status(500).send("Failed to create PayPal payment.");
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        // Redirect to PayPal approval URL
                        return res.json({ redirectUrl: payment.links[i].href });
                    }
                }
            }
        })
    } catch (error) {
        res.render('Users/404error')
    }
}


exports.successQuickPayement = async (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const itemId = req.query.itemId
        
        const execute_payment_json = {
            payer_id: payerId
        };
        delete req.session.couponRate
        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
            if (error) {
                console.error(error.response);
                throw error;
            } else {

                await Order.updateOne(
                    { 'items._id': itemId },
                    { $set: { 'items.$.status': 'Odered' } }
                );
                res.render('Users/successOrder')
            }
        })
    } catch (error) {
        res.render('Users/404error')
    }
}
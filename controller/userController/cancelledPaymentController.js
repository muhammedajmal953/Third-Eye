const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");



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

        res.redirect('/user/orders')
    } catch (error) {
        console.log(error);
    }
}
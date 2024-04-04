const { response } = require("express");
const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const Users = require("../../model/userModel");
const paypal = require('paypal-rest-sdk');
const Wallet = require("../../model/walletModel");
const Coupon = require("../../model/couponModel")


paypal.configure({
  'mode': 'sandbox',
  'client_id': 'AX5fcandM_opUkzH-7B0N8FJeY7awBX_tNau7wbqJO5fTNMPOYHqImN2cGZ9T04wj7Wq99evpGnne66r',
  'client_secret': 'ENICeukRb1vfgmDfMVF4AUikC44J102ReBewE6mXSWdLDZTBsd8_s9mUn9Jpt3Za3WcbrnK83_ZpEPnG'
});

require('dotenv').config({ path: '../../.env' })

exports.get_checkout = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await Users.findById(userId);
    const addresses = user.address;
    const cart = await Cart.findOne({ userId: userId });
    const products = cart.produts;
    const today = new Date()
    const coupons = await Coupon.find({ validity: { $gte: today } })




    res.render("./Users/checkout", {
      user,
      addresses,
      cart,
      products,
      coupons
    });
  } catch (error) {

  }
};





exports.orderPlace = async (req, res) => {
  try {
    // Retrieve data from the request
    let { cart, address, paymentMethod } = req.query;

    let userId = req.session.user;
    // Fetch user and cart details from the database
    let user = await Users.findById(userId);
    let userCart = await Cart.findById(cart);
    let { username, email } = user;
    let { totalPrice, products } = userCart;
    let items = products;
    console.log(paymentMethod);

    console.log(items);


    if (req.session.couponRate && req.query.coupon) {
      let couponRate = req.session.couponRate


      totalPrice = Math.floor(totalPrice - (totalPrice * couponRate / 100))


      items.forEach(item => {
        item.price = Math.floor(item.price - (item.price * couponRate / 100))
      });



      delete req.session.couponRate
    }




    if (paymentMethod === 'paypal') {
      let totalAmount = totalPrice.toFixed(2); // Format total amount for PayPal payment
      let amount = totalAmount.toString();

      const paypalPayment = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": `http://localhost:5000/user/successOrder?cart=${cart}`, // Your success URL
          "cancel_url": 'http://localhost:5000/cancel'    // Your cancel URL
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
          // Save order data temporarily in session
          req.session.orderData = {
            userId,
            username,
            email,
            shippingAddress: address,
            items,
            totalAmount: totalPrice,
            paymentMethod,
            cart: cart,
            paymentId: payment.id
          };

          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              // Redirect to PayPal approval URL
              return res.json({ redirectUrl: payment.links[i].href });
            }
          }
        }
      });
    } else if (paymentMethod === 'Cod') {
      // Handle non-PayPal payment method
      const order = new Order({
        username,
        email,
        userId,
        shippingAddress: address,
        items,
        totalAmount: totalPrice,
        paymentMethod
      });

      await order.save();
      await Cart.deleteOne({ _id: cart });
      for (let i = 0; i < items.length; i++) {
        await Product.updateOne(
          { _id: items[i].productId },
          { $inc: { quantity: -items[i].cartQty } }
        );
      }
      return res.json("your order throug Cash on delivery");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Order not placed.");
  }
};
exports.successOrder = async (req, res) => {
  let orderData = req.session.orderData
  let cart = req.query.cart
  // Fetch user and cart details from the database
  let userCart = await Cart.findById(cart);
  let { products } = userCart;
  let items = products;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId
  };

  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.error(error.response);
      throw error;
    } else {
      let order = new Order({
        userId: orderData.userId,
        username: orderData.username,
        email: orderData.email,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentId: paymentId

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

      res.render('Users/successOrder')
    }
  })


}

exports.orderView = async (req, res) => {
  try {
    const userId = req.session.user;

    const orders = await Order.find({ userId: userId }).sort({ odrderedDate: -1 });
    const user = await Users.findById(userId);
    if (!orders) {
      res.render("./Users/orderList", { items: {}, user });
    }
    if (orders.length > 0) {

      const items = orders.flatMap((order) => order.items);


      if (user) {
        console.log("User is ok");
      }

      res.render("./Users/orderList", { items, user });
    } else {
      console.log("No orders found for the user");
      // Render the view with an empty array of items
      res.render("./Users/orderList", { items: [], user });
    }
  } catch (error) {
    console.error("Error retrieving orders:", error);
    // Handle the error and render an error page or provide appropriate response
    res.status(500).send("Error retrieving orders");
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const { productId, cartQty, itemsId } = req.query
    const userId = req.session.user

    console.log(itemsId);

    await Order.updateOne(
      { userId: userId, 'items._id': itemsId },
      { $set: { 'items.$.status': 'Cancelled' } } // Update the status of the specific item
    );
    const product = await Product.updateOne({ _id: productId }, { $inc: { quantity: cartQty } })
    res.status(200).json({ message: 'Order successfully cancelled.' });

  } catch (error) {

  }
}

exports.returnOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const { productId, cartQty, itemId } = req.query;


    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const amount = product.price * cartQty;

    let returnDetails = {
      amount,
      userId,
      productId,
      itemId
    }
    req.session.returnDetails = returnDetails


    await Order.updateOne(
        { userId: userId, 'items._id': itemId },
        { $set: { 'items.$.status': 'Waiting for Return Confirmation' } }
      );
    res.json('Return is Waiting for confirmation')

  } catch (error) {
    console.error('Error in returning order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const itemId = req.query.itemId

    const index = req.query.index

    const order = await Order.findOne({ 'items._id': itemId })

    const orderedItem = order.items.find(item => item._id.toString() === itemId);


    res.render('./Users/orderDetails', { order, orderedItem })
  } catch (error) {
    console.log(error);
  }
}
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const Users = require("../model/userModel");


exports.get_checkout = async (req, res) => {
    try {
      const userId = req.session.user;
      const user = await Users.findById(userId);
      const addresses = user.address;
      const cart = await Cart.findOne({ userId: userId });
      const products = cart.produts;
      res.render("./Users/checkout", {
        user,
        addresses,
        cart,
        products,
      });
    } catch (error) {
  
    }
  };
  

exports.orderPlace = async (req, res) => {
    try {
  
      let userId = req.session.user;
      let { cart, address } = req.query;
      let user = await Users.findById(userId);
      let userCart = await Cart.findById(cart);
      let { username, email } = user;
      let { totalPrice, products } = userCart;
      let items = [];
      items = products;
  
      const order = new Order({
        username,
        email,
        userId,
        shippingAddress: address,
        items,
        totalAmount: totalPrice,
        paymentMethod: "Cod",
      });
  
      await order.save();
      await Cart.deleteOne({ _id: cart });
      for (i = 0; i < items.length; i++) {
        await Product.updateOne(
          { _id: items[i].productId },
          { $inc: { quantity: -items[i].cartQty } }
        );
      }
      res.send("product ordered");
    } catch (error) {
      console.error(error);
      res.status(500).send("order not placed");
    }
  };
  
exports.orderView = async (req, res) => {
    try {
      const userId = req.session.user;
  
      const orders = await Order.find({ userId: userId }).sort({ odrderedDate: -1 });
  
      if (orders.length > 0) {
  
        const items = orders.flatMap((order) => order.items);
  
        const user = await Users.findById(userId);
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
      const { productId, cartQty } = req.query
      const userId = req.session.user
      const product = await Product.updateOne({ _id: productId }, { $inc: { quantity: cartQty } })
  
      await Order.updateOne(
        { userId: userId, 'items.productId': productId }, // Find the order with the specific product
        { $set: { 'items.$.status': 'Cancelled' } } // Update the status of the specific item
      );
  
      res.status(200).json({ message: 'Order successfully cancelled.' });
  
    } catch (error) {
  
    }
  }


exports.orderDetails = async (req, res) => {
    try {
      const itemId = req.query.itemId
      console.log('id', itemId);
      const index = req.query.index
      console.log('index', index)
      const order = await Order.findOne({ 'items._id': itemId })
  
      const orderedItem = order.items.find(item => item._id.toString() === itemId);
  
      console.log(' orderedItem:', orderedItem);
  
      res.render('./Users/orderDetails', { order, orderedItem })
    } catch (error) {
      console.log(error);
    }
  }
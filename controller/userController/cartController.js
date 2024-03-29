const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const CatagoryOffer = require("../../model/offerModel");
const ProductOffer = require("../../model/productOfferModel")



//handling add to cart
exports.addToCart = async (req, res) => {
  try {
    let userId = req.session.user;
    let { productId } = req.query;

    const product = await Product.findOne({ _id: productId });
    let { productName, price, quantity,catagory } = product;
    let imageUrl = product.images[0];
    let cart = await Cart.findOne({ userId });
    let cartQty = 1;

    if (cart) {
      let cartTotal = cart.totalPrice;
      let itemIndex = cart.products.findIndex((p) => p.productId == productId);
      if (itemIndex > -1) {
        let productItem = cart.products[itemIndex];
        productItem.quantity = quantity;
        cart.products[itemIndex] = productItem;
      } else {
        cart.products.push({
          productId,
          productName,
          price,
          quantity,
          cartQty,
          imageUrl,
          catagory
        });
        cart.totalPrice = cartTotal + price;
        cart = await cart.save();
      }
      res.redirect("/user/cart");
    } else {
      const newCart = new Cart({
        userId,
        products: [
          {
            productId,
            productName,
            price,
            quantity,
            cartQty,
            imageUrl,
            catagory
          },
        ],
        totalPrice: price,
      });
      newCart.save();
      res.redirect("/user/cart");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

exports.show_cart = async (req, res) => {
  try {
    const userId = req.session.user;
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()
    const userCart = await Cart.findOne({ userId: userId });
    if (!userCart) {
      return res.render("./Users/cart", { products: "", userCart: "" });
    }

    const products = userCart.products;
    const productQuantity = []

    for (i = 0; i < products.length; i++) {
      const prdct = await Product.findOne({ _id: products[i].productId })

      productQuantity[i] = prdct.quantity
    }

    for (let product of products) {
      for (item of productOffer) {
        if (product.productName === item.productName) {
          product.pOffer = item.offer
        }
      }
      for (item of catagoryOffer) {
        if (product.catagory === item.catagoryName) {
          product.cOffer = item.offer
        }
      }
    }

    res.render("./Users/cart", { products, userCart, productQuantity });
  } catch (error) { }
};

//remove from cart

exports.removeCart = async (req, res) => {
  try {
    const productId = req.query.productId;
    let price = parseInt(req.query.price); // Parse price to ensure it's a number
    let cartQty = parseInt(req.query.cartQty);

    price = price * cartQty;

    // Remove the product from the cart
    await Cart.updateOne(
      { "products._id": productId },
      { $pull: { products: { _id: productId } }, $inc: { totalPrice: -price } }
    );

    // Find the cart and update the total price

    // Send a success response back to the client
    res.status(200).json("Product removed from cart successfully.");
  } catch (error) {
    // Handle any errors that occur during the update operation
    console.error("Error removing product from cart:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.totalIncrement = async (req, res) => {
  try {
    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: price, "products.$.cartQty": 1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    res.status(200).json(totalPrice);
  } catch (error) {
    console.error("Error incrementing product quantity in cart:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.totalDecrement = async (req, res) => {
  try {
    console.log("accessed decrement");
    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: -price, "products.$.cartQty": -1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    res.status(200).json(totalPrice);
  } catch (error) {
    console.error("Error incrementing product quantity in cart:", error);
    res.status(500).send("Internal server error.");
  }
};

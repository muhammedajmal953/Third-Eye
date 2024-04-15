const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const CatagoryOffer = require("../../model/offerModel");
const ProductOffer = require("../../model/productOfferModel")
const Coupon = require("../../model/couponModel");
const { response } = require("express");


//handling add to cart
exports.addToCart = async (req, res) => {
  try {
    let userId = req.session.user;


    if (!userId) {
      return res.json('')
    }
    


    let { productId } = req.query;

    const product = await Product.findOne({ _id: productId });
    let { productName, price, quantity, catagory } = product;
    let imageUrl = product.images[0];
    let cart = await Cart.findOne({ userId });
    let cartQty = 1;
    if (quantity <= 0) {
      return res.json('product is out of stock')
    }
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
      return res.json('success')
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
      return res.json('success')
    }
  } catch (error) {
    console.log(error);
    res.render('Users/404error')
  }
};

exports.show_cart = async (req, res) => {
  try {
    const userId = req.session.user;
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()
    const userCart = await Cart.findOne({ userId: userId });
    if (!userCart) {
      return res.render("./Users/cart", { products: "", userCart: "",totalProducts:0, productQuantity:0 });
    }

    const products = userCart.products;
    const productQuantity = []
    let totalProducts=0

    for (i = 0; i < products.length; i++) {
      const prdct = await Product.findOne({ _id: products[i].productId })
      products[i].price = prdct.price
      productQuantity[i] = prdct.quantity
      totalProducts+=products[i].cartQty
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
    
    res.render("./Users/cart", { products, userCart, productQuantity ,totalProducts});
  } catch (error) { 
    res.render('Users/404error')
  }
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

   

    // Send a success response back to the client
    res.status(200).json("Product removed from cart successfully.");
  } catch (error) {
    // Handle any errors that occur during the update operation
    console.error("Error removing product from cart:", error);
    res.render('Users/404error')
   
  }
};

exports.totalIncrement = async (req, res) => {
  try {
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()
   
    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    let totalDiscount=0
    
    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: price, "products.$.cartQty": 1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    

   
    const products = cart.products

  
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
     
    for (let item of products) {
      let offerOfitem = item.pOffer > item.cOffer ? item.pOffer : item.cOffer||0;
      let discountPrice=item.price-Math.floor(item.price-(item.price*offerOfitem/100))
      totalDiscount += discountPrice * item.cartQty;
    }

    
    let totalProducts=products.reduce((acc,cur)=>acc+=cur.cartQty,0)
    let data = {
      totalPrice,
      totalProducts,
      totalDiscount
    }
    res.status(200).json(data);
  } catch (error) {
    console.log("Error incrementing product quantity in cart:", error);
    res.render('Users/404error')
  }
};





exports.totalDecrement = async (req, res) => {
  try {
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()

    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: -price, "products.$.cartQty": -1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    let totalDiscount=0
    const products = cart.products
    
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

    for (let item of products) {
      let offerOfitem = item.pOffer > item.cOffer ? item.pOffer : item.cOffer||0;
      let discountPrice=item.price-Math.floor(item.price-(item.price*offerOfitem/100))
      totalDiscount += discountPrice * item.cartQty;
    }


    let totalProducts=products.reduce((acc,cur)=>acc+=cur.cartQty,0)
    let data = {
      totalPrice,
      totalProducts,
      totalDiscount
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error incrementing product quantity in cart:", error);
    res.render('Users/404error')
  }
};






exports.applyCoupon = async (req, res) => {
  try {
    let { totalPrice, couponCode, totalDiscount } = req.body

    const coupon = await Coupon.findOne({ code: couponCode })

    if (!coupon) {
      return res.json('No coupon found')
    }


  
    let price = Number(totalPrice) - Number(totalDiscount)
    let couponOffer = parseFloat(coupon.offer)


    let discountPrice = 0
    discountPrice = Math.floor(price - (price * couponOffer / 100))

 
    req.session.couponRate = couponOffer

 
    res.json(discountPrice)
  } catch (error){
    res.render('Users/404error')
  }

}


exports.removeCoupon = async (req, res) => {
  try {
    const { totalPrice, totalDiscount } = req.body.totalPrice
  
    delete req.session.couponRate

    res.json(totalPrice - totalDiscount)
  } catch(error) {
    res.render('Users/404error')
  }
}
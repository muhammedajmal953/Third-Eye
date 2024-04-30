const Product = require("../../model/productModel");
const Admin = require("../../model/adminModel");
const Catagory = require("../../model/catagoryModel");
const Order = require("../../model/orderModel");
const Users = require("../../model/userModel");


// Render login page
exports.get_login = (req, res) => {
  try {
    let  message  =req.query.message
    if (req.session.admin) {
      // If admin is already logged in, redirect to dashboard
      return res.redirect("/admin/dashboard");
    }
    // not logged in redirect to login page
    return res.render("./admin/login", { message });
  } catch (error) {
   
    console.error("Error rendering login page:", error);
    res.render('admin/admin404')
  }
};

//admin login handling 
    
exports.admin_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admins = await Admin.findOne({ email: email, password: password });
    if (!admins) {
      return res.redirect("/admin?message=invalid credentials");
    }
    if (email == admins.email && password == admins.password) {
      req.session.admin = admins._id;
      res.redirect("/admin/Dashboard");
    } else {
      return res.redirect("/admin?message=invalid credentials");
    }
  } catch (error) {
    res.render('admin/admin404')
  }
};

//dash board rendering

exports.getDashboard = async (req, res) => {
  try {
    const users = await Users.find();
    const data = await Order.find({}, { totalAmount: 1, odrderedDate: 1 });

    const amounts = data.map((item) => item.totalAmount);
    const productsCount = await Product.countDocuments();



    let totalOrder = 0;
    let yearData = {}
    let orders = await Order.find();

    //get year base data
    for (let order of orders) {
      const year = order.odrderedDate.getFullYear();
      if (!yearData[year]) {

        yearData[year] = 0;

      }

      yearData[year] += order.totalAmount;
      totalOrder += order.items.length;


    }

    let revenue = amounts.reduce((acc, cur) => (acc += cur),0);

    const monthlyDataLastYear = Array(12).fill(0);
    const currentDate = new Date();
    const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());


    const monthlyOrders = await Order.find({
      odrderedDate: { $gte: oneYearAgo, $lte: currentDate }
    });


    monthlyOrders.forEach(order => {
      const month = order.odrderedDate.getMonth()

      monthlyDataLastYear[month] += order.totalAmount;

    });


    const weeklyData = Array(7).fill(0);

    const oneWeekAgo = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);


    const weeklyOrders = await Order.find({
      odrderedDate: { $gte: oneWeekAgo, $lte: currentDate }
    });


    weeklyOrders.forEach(order => {
      const week = order.odrderedDate.getMonth()


      const dayOfWeek = order.odrderedDate.getDay();
      weeklyData[dayOfWeek] += order.totalAmount;


    });


    //top seeling products
    const bestSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', totalSold: { $sum: 1 } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ])

    let products = []
    let catagories = [];


    if (bestSellingProducts && bestSellingProducts.length > 0) {

      const productPromises = bestSellingProducts.map(async (item) => {
        let prdct = await Product.findOne({ _id: item._id });
        return prdct;
      });

      products = await Promise.all(productPromises)


      const categoryPromises = products.map(async (item) => {
      

        let prdct = await Catagory.findOne({ catagoryName: item.catagory });

        return prdct;

      });


      const resolvedCategories = await Promise.all(categoryPromises);


      const distinctCategories = resolvedCategories.filter((item, index, self) => {
        return self.findIndex((t) => t._id.toString() === item._id.toString()) === index;
      });

      catagories = distinctCategories;

    }
     
    catagories

    res.render("admin/index", {
      users: users,
      yearData,
      products,
      catagories,
      monthlyDataLastYear,
      weeklyData,
      productsCount,
      totalOrder,
      revenue
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render('admin/admin404')
  }
};

//userlist rendering
exports.userList = async (req, res) => {
  try {
    const users = await Users.find();
    res.render("./admin/customers-details", { users: users });
  } catch (error) { 
    res.render('admin/admin404')
  }
};

//block user
exports.user_block = async (req, res) => {
  try {
    const id = req.query.id;
    await Users.updateOne(
      { _id: id },
      {
        $set: { isBlocked: true },
      }
    );
    res.redirect("/admin/customers");
  } catch {
    res.render('admin/admin404')
   }
};

//unblock user

exports.user_unblock = async (req, res) => {
  try {
    const id = req.query.id;
    await Users.updateOne(
      { _id: id },
      {
        $set: { isBlocked: false },
      }
    );
    res.redirect("/admin/customers");
  } catch {
    res.render('admin/admin404')
   }
};

// adminLogout handling
exports.admin_logout = (req, res) => {
  try {
    delete req.session.admin;
    res.redirect("/admin");
  } catch (error) {
    res.render('admin/admin404')
   }
};

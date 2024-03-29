const Product = require("../../model/productModel");
const Admin = require("../../model/adminModel");
const Order = require("../../model/orderModel");
const Users = require("../../model/userModel");

// Render login page
exports.get_login = (req, res) => {
  try {
    if (req.session.admin) {
      // If admin is already logged in, redirect to dashboard
      return res.redirect("/admin/dashboard");
    }
    // not logged in redirect to login page
    return res.render("./admin/login");
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error("Error rendering login page:", error);
  }
};

//admin login handling

exports.admin_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admins = await Admin.findOne({ email: email, password: password });
    if (email == admins.email && password == admins.password) {
      req.session.admin = admins._id;
      res.redirect("/admin/Dashboard");
    } else {
      req.session.error = "Invalid Credentials";
      return res.redirect("/admin");
    }
  } catch (error) {
    res.status(500).send("invalid credentials");
  }
};

//dash board rendering

exports.getDashboard = async (req, res) => {
  try {
    const users = await Users.find();
    const data = await Order.find({}, { totalAmount: 1, odrderedDate: 1 });
    const labels = data.map((item) => item.odrderedDate);
    const amounts = data.map((item) => item.totalAmount);
    const productsCount = await Product.countDocuments();

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Total Amount",
          data: amounts,
        },
      ],
    };

    let totalOrder = 0;
    let orders = await Order.find();
    for (let order of orders) {
      totalOrder += order.items.length;
    }
    let revenue = amounts.reduce((acc, cur) => (acc += cur));

    res.render("admin/index", {
      users: users,
      chartData: chartData,
      productsCount,
      totalOrder,
      revenue
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};

//userlist rendering
exports.userList = async (req, res) => {
  try {
    const users = await Users.find();
    res.render("./admin/customers-details", { users: users });
  } catch (error) {}
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
  } catch {}
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
  } catch {}
};

// adminLogout handling
exports.admin_logout = (req, res) => {
  try {
    delete req.session.admin;
    res.redirect("/admin");
  } catch (error) {}
};

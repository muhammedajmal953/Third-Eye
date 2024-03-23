const Order = require("../../model/orderModel");

exports.orders = async (req, res) => {
    try {
      const totalOrders = await Order.find();
      const curPage = req.query.page || 1;
      const totalPages = Math.ceil(totalOrders.length / 10);
  
      const skip = (curPage - 1) * 10;
      const orders = await Order.find()
        .sort({
          odrderedDate: -1,
        })
        .skip(skip)
        .limit(10);
      if (!orders) {
        res.render("./admin/orderManage", { orders: "", totalPages: [] });
      }
      res.render("./admin/orderManage", { orders, totalPages });
    } catch (error) {}
  };
  
  exports.ordersDetails = async (req, res) => {
    try {
      const orderId = req.query.orderId;
  
      const order = await Order.findById(orderId);
  
      const orderedItems = order.items;
  
      res.render("./admin/orderdetails", { orderedItems, order });
    } catch (error) {}
  };
  
  exports.change_status = async (req, res) => {
    try {
      const { changedStatus, itemsId } = req.body;
  
      const updateStatus = await Order.findOneAndUpdate(
        { "items._id": itemsId },
        { $set: { "items.$.status": changedStatus } },
        { returnOriginal: false }
      );
  
      res.status(200).json(changedStatus);
    } catch (error) {}
  };
  
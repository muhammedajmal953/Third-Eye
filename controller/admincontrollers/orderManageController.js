const Order = require("../../model/orderModel");
const PDFDocument = require('pdfkit-table');

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
  } catch (error) { }
};

exports.ordersDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;

    const order = await Order.findById(orderId);

    const orderedItems = order.items;

    res.render("./admin/orderdetails", { orderedItems, order });
  } catch (error) { }
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
  } catch (error) { }
};

exports.weeklyReport = async (req, res) => {
  try {
    const today = new Date();
    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() );

    // Query orders within the specified date range
    console.log(lastWeekStart);
    console.log(lastWeekEnd);
    const sales = await Order.find({
      odrderedDate: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    
    const formattedOrders = [];
 
    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/weeklyReport', { formattedOrders: [] });
    }
     let totalSales=0
    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress,  odrderedDate ,totalAmount} = order;
      
      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem ={
          username,
          shippingAddress,
          odrderedDate:odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty
          
        };
        formattedOrders.push(formattedItem);
      });
      totalSales=totalSales+totalAmount
    });
    console.log(totalSales);
    // Render the view with the formatted data
    res.render('admin/weeklyReport', { formattedOrders,totalSales });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.weeklyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Query orders within the specified date range
    console.log(lastWeekStart);
    console.log(lastWeekEnd);
    const sales = await Order.find({
      odrderedDate: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="weekly_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Weekly Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'Order Date', 'Product Name', 'Price', 'Quantity'];

    const formattedOrders = []
    let totalSales = 0
    

    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress, odrderedDate, totalAmount } = order;

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty
        ];
        
        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', totalSales]);
    console.log('formatted doc',formattedOrders);
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders
    };

    doc.table(tableOptions);

    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.dailyReport = async (req, res) => {
  try {
    const today = new Date();
    const yesterday= new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);

    const sales = await Order.find({
      odrderedDate: { $gte: yesterday, $lte:today }
    });
    
    const formattedOrders = [];
 
    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/dailyReport', { formattedOrders: [] });
    }
     let totalSales=0
    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress,  odrderedDate ,totalAmount} = order;
      
      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem ={
          username,
          shippingAddress,
          odrderedDate:odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty
          
        };
        formattedOrders.push(formattedItem);
      });
      totalSales=totalSales+totalAmount
    });
    console.log(totalSales);
    // Render the view with the formatted data
    res.render('admin/dailyReport', { formattedOrders,totalSales });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.dailyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const yesterday= new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);

    // Query orders within the specified date range
    console.log(today);
    console.log(yesterday);
    const sales = await Order.find({
      odrderedDate: { $gte:yesterday, $lte:today }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Daily Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'Order Date', 'Product Name', 'Price', 'Quantity'];

    const formattedOrders = []
    let totalSales = 0
    

    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress, odrderedDate, totalAmount } = order;

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty
        ];
        
        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', totalSales]);
    console.log('formatted doc',formattedOrders);
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders
    };

    doc.table(tableOptions);
     
    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.monthlyReport = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte:firstDayOfMonth, $lte:lastDayOfMonth }
    });
    
    const formattedOrders = [];
 
    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/monthlyReport', { formattedOrders: [] });
    }
     let totalSales=0
    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress,  odrderedDate ,totalAmount} = order;
      
      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem ={
          username,
          shippingAddress,
          odrderedDate:odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty
          
        };
        formattedOrders.push(formattedItem);
      });
      totalSales=totalSales+totalAmount
    });
    console.log(totalSales);
    // Render the view with the formatted data
    res.render('admin/monthlyReport', { formattedOrders,totalSales });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
exports.monthlyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte:firstDayOfMonth, $lte:lastDayOfMonth }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Monthly Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'Order Date', 'Product Name', 'Price', 'Quantity'];

    const formattedOrders = []
    let totalSales = 0
    

    // Iterate over each order document
    sales.forEach(order => {
      const { username, shippingAddress, odrderedDate, totalAmount } = order;

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty
        ];
        
        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', totalSales]);
    console.log('formatted doc',formattedOrders);
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders
    };

    doc.table(tableOptions);
     
    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
const Order = require("../../model/orderModel");
const PDFDocument = require('pdfkit-table');
const Wallet = require("../../model/walletModel");
const Product = require("../../model/productModel");

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
  } catch (error) {
    res.render('admin/admin404')
  }
};

exports.ordersDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;

    const order = await Order.findById(orderId);

    const orderedItems = order.items;

    res.render("./admin/orderdetails", { orderedItems, order });
  } catch (error) {
    res.render('admin/admin404')
  }
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
  } catch (error) {
    res.render('admin/admin404')
  }
};

exports.weeklyReport = async (req, res) => {
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

    const formattedOrders = [];

    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/weeklyReport', { formattedOrders: [] });
    }
    let actualTotal = 0
    let totalSales = 0
    let shipping = 0
    // Iterate over each order document
    for (let order of sales) {
      const { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      // Iterate over each item in the order
      for (let item of order.items) {
        const formattedItem = {
          username,
          _id,
          shippingAddress,
          odrderedDate: odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty

        };

        let product = await Product.findOne({ _id: item.productId })

        let actualPrice = product.price * item.cartQty
        shipping += item.cartQty * 40
        actualTotal += actualPrice


        formattedOrders.push(formattedItem);
      };
      totalSales = totalSales + totalAmount
    };



    // Render the view with the formatted data
    res.render('admin/weeklyReport', { formattedOrders, totalSales, actualTotal, shipping });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
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
    const tableHeaders = ["User's Name", 'Address', 'orderId', 'Order Date', 'Product Name', 'Price', 'Quantity', 'Total'];

    const formattedOrders = []
    let totalSales = 0


    // Iterate over each order document
    sales.forEach(order => {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;


      shippingAddress = shippingAddress.split(',').map(str => str.trim())
      shippingAddress.pop()

      shippingAddress = shippingAddress.join(',')




      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          _id,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty,
          item.price * item.cartQty
        ];

        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', '', '', totalSales]);
   
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders,
    };

    doc.table(tableOptions);

    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}

exports.dailyReport = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    const sales = await Order.find({
      odrderedDate: { $gt: yesterday, $lte: today }
    });

    const formattedOrders = [];

    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/dailyReport', { formattedOrders: [] });
    }
    let actualTotal = 0
    let totalSales = 0
    let shipping = 0
    // Iterate over each order document
    for (let order of sales) {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      // Iterate over each item in the order
      for (let item of order.items) {
        const formattedItem = {
          username,
          _id,
          shippingAddress,
          odrderedDate: odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty

        };

        let product = await Product.findOne({ _id: item.productId })

        let actualPrice = product.price * item.cartQty
        shipping += item.cartQty * 40
        actualTotal += actualPrice


        formattedOrders.push(formattedItem);
      };
      totalSales = totalSales + totalAmount
    };


    res.render('admin/dailyReport', { formattedOrders, totalSales, actualTotal, shipping });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}

exports.dailyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gt: yesterday, $lte: today }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Daily Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'orderId', 'Order Date', 'Product Name', 'Price', 'Quantity', 'Total'];

    const formattedOrders = []
    let totalSales = 0


    // Iterate over each order document
    sales.forEach(order => {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      shippingAddress = shippingAddress.split(',').map(str => str.trim())
      shippingAddress.pop()

      shippingAddress = shippingAddress.join(',')

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          _id,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty,
          item.price * item.cartQty
        ];

        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', '', '', totalSales]);
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
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    const formattedOrders = [];
    let totalSales = 0
    let actualTotal = 0
    let shipping = 0
    
    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/monthlyReport', { formattedOrders: [] ,totalSales, actualTotal, shipping});
    }
  
    // Iterate over each order document
    for (let order of sales) {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      // Iterate over each item in the order
      for (let item of order.items) {
        const formattedItem = {
          username,
          _id,
          shippingAddress,
          odrderedDate: odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty

        };

        let product = await Product.findOne({ _id: item.productId })

        let actualPrice = product.price * item.cartQty
        shipping += item.cartQty * 40
        actualTotal += actualPrice


        formattedOrders.push(formattedItem);
      };
      totalSales = totalSales + totalAmount
    };

    // Render the view with the formatted data
    res.render('admin/monthlyReport', { formattedOrders, totalSales, actualTotal, shipping });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}
exports.monthlyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Monthly Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'orderId', 'Order Date', 'Product Name', 'Price', 'Quantity', 'Total'];

    const formattedOrders = []
    let totalSales = 0


    // Iterate over each order document
    sales.forEach(order => {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      shippingAddress = shippingAddress.split(',').map(str => str.trim())
      shippingAddress.pop()

      shippingAddress = shippingAddress.join(',')

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          _id,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty,
          item.price * item.cartQty

        ];

        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', '','', totalSales]);
    console.log('formatted doc', formattedOrders);
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders
    };

    doc.table(tableOptions);

    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}

exports.customReport = async (req, res) => {
  try {
    let date = req.body.customDate
    // Query orders within the specified date range
    date = new Date(date)
    const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    console.log(date);
    const sales = await Order.find({
      odrderedDate: { $gte: date, $lt: nextDay }
    });

    const formattedOrders = [];
    let totalSales = 0
    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/customReport', { formattedOrders: [], totalSales, date });
    }

    let actualTotal = 0
    let shipping = 0
    // Iterate over each order document
    for (let order of sales) {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      // Iterate over each item in the order
      for (let item of order.items) {
        const formattedItem = {
          username,
          _id,
          shippingAddress,
          odrderedDate: odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty

        };

        let product = await Product.findOne({ _id: item.productId })

        let actualPrice = product.price * item.cartQty
        shipping += item.cartQty * 40
        actualTotal += actualPrice


        formattedOrders.push(formattedItem);
      };
      totalSales = totalSales + totalAmount
    };
    // Render the view with the formatted data
    res.render('admin/customReport', { formattedOrders, totalSales, date, actualTotal, shipping });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}


exports.customDownloads = async (req, res) => {
  try {
    let date = req.query.customDate
    // Query orders within the specified date range
    date = new Date(date)
    const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    console.log(date);
    const sales = await Order.find({
      odrderedDate: { $gte: date, $lt: nextDay }
    });
    const doc = new PDFDocument();
    let printDate = date.toDateString()
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${printDate}_report.pdf"`);

    doc.pipe(res);

    doc.fontSize(12).text('Custom Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'orderId', 'Order Date', 'Product Name', 'Price', 'Quantity', 'Total'];

    const formattedOrders = []
    let totalSales = 0


    // Iterate over each order document
    sales.forEach(order => {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;


      shippingAddress = shippingAddress.split(',').map(str => str.trim())
      shippingAddress.pop()

      shippingAddress = shippingAddress.join(',')


      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          _id,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty,
          item.price * item.cartQty
        ];

        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', '', '', totalSales]);
    console.log('formatted doc', formattedOrders);
    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders
    };

    doc.table(tableOptions);

    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}

exports.yearlyReport = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
    console.log(firstDayOfYear);
    console.log(lastDayOfYear);
    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte: firstDayOfYear, $lte: lastDayOfYear }
    });

    const formattedOrders = [];

    if (!sales || sales.length === 0) {
      // Render the view with an empty array if there are no sales
      return res.render('admin/yearlyReport', { formattedOrders: [] });
    }
    let actualTotal = 0
    let totalSales = 0
    let shipping = 0
    // Iterate over each order document
    for (let order of sales) {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;



      // Iterate over each item in the order
      for (let item of order.items) {
        const formattedItem = {
          username,
          _id,
          shippingAddress,
          odrderedDate: odrderedDate.toDateString(),
          productName: item.productName,
          price: item.price,
          quantity: item.cartQty

        };

        let product = await Product.findOne({ _id: item.productId })

        let actualPrice = product.price * item.cartQty
        shipping += item.cartQty * 40
        actualTotal += actualPrice


        formattedOrders.push(formattedItem);
      };
      totalSales = totalSales + totalAmount
    };
    // Render the view with the formatted data
    res.render('admin/yearlyReport', { formattedOrders, totalSales, actualTotal, shipping });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}


exports.yearlyDownloads = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 1, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    // Query orders within the specified date range
    const sales = await Order.find({
      odrderedDate: { $gte: firstDayOfYear, $lte: lastDayOfYear }
    });
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="yearly_sales_report.pdf"');

    doc.pipe(res);

    doc.fontSize(12).text('Yearly Sales Report', { align: 'center' }).moveDown();
    const tableHeaders = ["User's Name", 'Address', 'orderId', 'Order Date', 'Product Name', 'Price', 'Quantity', 'total'];

    const formattedOrders = []
    let totalSales = 0


    // Iterate over each order document
    sales.forEach(order => {
      let { username, shippingAddress, odrderedDate, totalAmount, _id } = order;

      shippingAddress = shippingAddress.split(',').map(str => str.trim())
      shippingAddress.pop()

      shippingAddress = shippingAddress.join(',')

      // Iterate over each item in the order
      order.items.forEach(item => {
        const formattedItem = [
          username,
          shippingAddress,
          _id,
          odrderedDate.toDateString(),
          item.productName,
          item.price,
          item.cartQty,
          item.price * item.cartQty
        ];

        formattedOrders.push(formattedItem);
      });
      totalSales = totalSales + totalAmount
    });

    // Push total sales as a separate row at the end
    formattedOrders.push(['Total sales', '', '', '', '', '', '', totalSales]);

    const tableOptions = {
      headers: tableHeaders,
      rows: formattedOrders,
      border: {
        top: true,
        bottom: true,
        left: true,
        right: true,
      },
      borderColor: 'black'
    };

    doc.table(tableOptions);

    doc.end();

  } catch (error) {
    // Handle errors
    console.error(error);
    res.render('admin/admin404')
  }
}



exports.approveReturn = async (req, res) => {
  try {
    const { productId, cartQty, itemId, userId } = req.body

    console.log(req.body);
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const amount = product.price * cartQty;

    let wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      wallet = new Wallet({
        userId: userId,
        balance: amount,
        transaction: [{ status: `Refund`, date: Date.now(), amount: amount }]
      });
      await wallet.save();
    } else {

      await Wallet.findOneAndUpdate({ userId: userId }, { $inc: { balance: amount }, $push: { transaction: { status: `Refund`, date: Date.now(), amount: amount } } })
    }
    await Product.findOneAndUpdate({ _id: productId }, { $inc: { quantity: cartQty } });

    await Order.updateOne(
      { userId: userId, 'items._id': itemId },
      { $set: { 'items.$.status': 'Returned' } }
    );

    res.json('success');
  } catch (error) {
    res.render('admin/admin404')
  }
}
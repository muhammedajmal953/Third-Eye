const Users = require("../../model/userModel");
const bcrypt = require("bcrypt");
const paypal = require('paypal-rest-sdk');
const Wallet = require("../../model/walletModel");

//handle user Profile View
exports.view_profile = async (req, res) => {
  try {
    const id = req.session.user;

    const user = await Users.findOne({ _id: id });

    if (user) {
      return res.render("./Users/userProfile", { user });
    }
  } catch (error) {

  }
};

//handle edit profile  get

exports.edit_profile = async (req, res) => {
  try {
    const id = req.query.id;

    const user = await Users.findOne({ _id: id });

    if (user) {
      return res.render("./Users/editProfile", { user, message: '' });
    }
  } catch (error) { }
};

//edtit profile saving
exports.update_profile = async (req, res) => {
  try {
    const id = req.query.id;
    const { email, username, phone } = req.body;

    const updates = {
      email,
      username,
      phone
    };
    await Users.findByIdAndUpdate(id, updates);
    res.redirect("/user/profile");
  } catch (error) { }
};

//change password updating
exports.change_password = async (req, res) => {
  try {
    let password = req.query.password;

    const { oldPassword, newPassword } = req.body;

    // Retrieve the user's current password from the database
    const user = await Users.findOne({ password });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided old password with the one stored in the database
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.render("./Users/editProfile", { user, message: 'Password changed Succesfully' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await Users.updateOne({ _id: user._id }, { password: hashedNewPassword });

    res.redirect("/user/profile");

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//user wallet

exports.wallet = async (req, res) => {
  let userId = req.session.user

  let wallet = await Wallet.findOne({ userId: userId })

  if (!wallet) {
    wallet = {
      balance: 0,
      transaction: []
    }

  }
  res.render('Users/wallet', { wallet })
}



exports.walletRecharge = async (req, res) => {
  const amount = req.query.amount
  paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AX5fcandM_opUkzH-7B0N8FJeY7awBX_tNau7wbqJO5fTNMPOYHqImN2cGZ9T04wj7Wq99evpGnne66r',
    'client_secret': 'ENICeukRb1vfgmDfMVF4AUikC44J102ReBewE6mXSWdLDZTBsd8_s9mUn9Jpt3Za3WcbrnK83_ZpEPnG'
  });
  const paypalPayment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": `http://localhost:5000/user//updateWallet?amount=${amount}`, // Your success URL
      "cancel_url": 'http://localhost:5000/user/wallet'    // Your cancel URL
    },
    "transactions": [{
      "amount": {
        "total": String(amount),
        "currency": "USD"
      },
      "description": "Your Wallet recharge goes here goes here."
    }]
  };

  // Create PayPal payment
  paypal.payment.create(paypalPayment, async function (error, payment) {
    if (error) {
      console.error(error);
      return res.status(500).send("Failed to create PayPal payment.");
    } else {

      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          // Redirect to PayPal approval URL
          return res.json({ redirectUrl: payment.links[i].href });
        }
      }
    }
  });
}

exports.updateWallet = async (req, res) => {
  let amount = req.query.amount
  let userId = req.session.user
  const paymentId = req.query.paymentId;
  const payerId = req.query.PayerID;


  const execute_payment_json = {
    payer_id: payerId
  };

  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.error(error.response);
      throw error;
    } else {
      let wallet = await Wallet.findOne({ userId: userId })
      if (!wallet) {
        const newWallet = new Wallet({
          userId: userId,
          balance: amount,
          transaction: [{ status: `Credited`, amount: `${amount}`, date: Date.now() }]
        })
        await newWallet.save()
        return res.redirect(`/user/wallet`)
      }
      console.log(paymentId);

      await Wallet.findOneAndUpdate({ userId: userId }, { $inc: { balance: amount }, $push: { transaction: [{ status: `Credited`, amount: amount, date: Date.now() }] } })
      return res.redirect(`/user/wallet`)
    }
  })
}


exports.walletWithDraw = async (req, res) => {
  const money = req.query.amount
  const userId = req.session.user
  await Wallet.updateOne({ userId: userId }, { $inc: { balance: -money }, $push: { transaction: [{ status: 'Debited', amount: money, date: Date.now() }] } })

  res.json('success')
}
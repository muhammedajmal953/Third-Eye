const express=require('express')
const adminControler=require('../controller/adminController')
const Users = require('../model/userModel');
const {upload,uploadProduct} = require('../middlewares/uploadImage');
const Catagory = require('../model/catagoryModel');
const Product = require('../model/productModel');
const { isAdminLoggedIn } = require('../middlewares/isLoggedin');



const adminRoutes=express.Router()


adminRoutes.get('/',adminControler.get_login)

adminRoutes.post('/login',adminControler.admin_login)

adminRoutes.get('/dashboard',isAdminLoggedIn,adminControler.getDashoard)


adminRoutes.get('/customers',isAdminLoggedIn,adminControler.userList)


adminRoutes.post('/block-user',adminControler.user_block)

adminRoutes.post('/unBlock-user',adminControler.user_unblock)

adminRoutes.get('/catagory',isAdminLoggedIn,async (req,res)=>{
    const catagory=await Catagory.find()

    res.render("./admin/catagory",{catagory:catagory})
})
adminRoutes.get('/add-catagory',isAdminLoggedIn,async (req,res)=>{
    res.render("./admin/addCatagory",{message:''})
})

adminRoutes.post('/add-catagory',upload.single('image'),adminControler.add_catagory)

adminRoutes.get('/edit-catagory',isAdminLoggedIn,async (req,res)=>{
    const id = req.query.id
    const message=req.query.message
    const catag=await Catagory.findOne({_id:id})
    res.render('./admin/editCatagory',{message:message,catag:catag})
})
adminRoutes.post('/edit-catagory/:id',upload.single('image'),adminControler.edit_catagory)

 
adminRoutes.post('/remove-catagory',adminControler.remove_catagory)


adminRoutes.post('/unRemove-catagory',adminControler.unRemove_catagory)

adminRoutes.get('/unlisted-catagory',isAdminLoggedIn,async (req,res)=>{
    const catagory=await Catagory.find()

    res.render("./admin/removedCatagory",{catagory:catagory})
}) 

adminRoutes.get('/products',isAdminLoggedIn,async (req,res)=>{
    const product=await Product.find()

    res.render("./admin/productList",{product:product})
})


adminRoutes.get('/add-product',isAdminLoggedIn,async (req,res)=>{
    const catagory=await Catagory.find()

    res.render("./admin/addProduct" ,{catagory:catagory})
})

adminRoutes.get('/edit-product',async (req,res)=>{
    const id=req.query.id
    const product=await Product.findOne({_id:id})
    const catagory=await Catagory.find()
    
    res.render("./admin/editProduct",{product:product,catagory:catagory})
})

adminRoutes.get('/unListedProducts',isAdminLoggedIn,async (req,res)=>{
    const product=await Product.find()

    res.render("./admin/unListedproducts",{product:product})
})



adminRoutes.post('/add-product',uploadProduct.array('images',5),adminControler.add_products)


adminRoutes.post('/edit-product/:id',uploadProduct.array('images',5),adminControler.edit_products)

adminRoutes.post('/unlist-product',adminControler.unlist_product)

adminRoutes.post('/list-product',adminControler.list_products)

adminRoutes.get('/orders',isAdminLoggedIn, adminControler.orders)

adminRoutes.get('/viewOrder', isAdminLoggedIn, adminControler.ordersDetails)

adminRoutes.post('/orderStatus',adminControler.change_status)

adminRoutes.get('/logout',adminControler.admin_logout)

module.exports=adminRoutes
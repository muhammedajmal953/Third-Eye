const express=require('express')
const adminControler=require('../controller/admincontrollers/adminController')
const catagoryController=require('../controller/admincontrollers/catagoryController')
const productController = require('../controller/admincontrollers/productController')
const orderManageController = require('../controller/admincontrollers/orderManageController')

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

adminRoutes.post('/add-catagory',upload.single('image'),catagoryController.add_catagory)

adminRoutes.get('/edit-catagory',isAdminLoggedIn,async (req,res)=>{
    const id = req.query.id
    const catag=await Catagory.findOne({_id:id})
    res.render('./admin/editCatagory',{message:'',catag:catag})
})
adminRoutes.post('/edit-catagory/:id',upload.single('image'),catagoryController.edit_catagory)

 
adminRoutes.post('/remove-catagory',catagoryController.remove_catagory)


adminRoutes.post('/unRemove-catagory',catagoryController.unRemove_catagory)

adminRoutes.get('/unlisted-catagory',isAdminLoggedIn,async (req,res)=>{
    const catagory=await Catagory.find()

    res.render("./admin/removedCatagory",{catagory:catagory})
}) 

adminRoutes.get('/products',isAdminLoggedIn,productController.products)


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



adminRoutes.post('/add-product',uploadProduct.array('images',5),productController.add_products)


adminRoutes.post('/edit-product/:id',uploadProduct.array('images',5),productController.edit_products)

adminRoutes.post('/unlist-product',productController.unlist_product)

adminRoutes.post('/list-product',productController.list_products)

adminRoutes.get('/orders',isAdminLoggedIn, orderManageController.orders)

adminRoutes.get('/viewOrder', isAdminLoggedIn, orderManageController.ordersDetails)

adminRoutes.post('/orderStatus',orderManageController.change_status)

adminRoutes.get('/logout',adminControler.admin_logout)

module.exports=adminRoutes
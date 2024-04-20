const Catagory = require("../../model/catagoryModel")
const Coupon = require("../../model/couponModel")
const CatagoryOffer = require("../../model/offerModel")
const Product = require("../../model/productModel")
const ProductOffer = require("../../model/productOfferModel")
const Referal = require("../../model/referalModel")


exports.referal = async (req, res) => {
    try {
        const referal = await Referal.find()
        if (!referal) {
            res.render('admin/referalOffer', { referal: [] })
        }

        res.render('admin/referalOffer', { referal })

    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.saveReferal = async (req, res) => {
    try {
        const { referralOffer, referredOffer, validity } = req.body

        const newDate = new Date(validity)

        const referal = new Referal({
            referalOffer: referralOffer,
            referedOffer: referredOffer,
            Validity: newDate
        })
        referal.save()

        res.redirect('/admin/referalOffer')

    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.deleteReferal = async (req, res) => {
    try {
        const referalId = req.query.id

        await Referal.deleteOne({ _id: referalId })

        res.redirect('/admin/referalOffer')

    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.catagoryOffer = async (req, res) => {
    try {
        const catagories = await Catagory.find({ isActive: true })

        const catagoryOffer = await CatagoryOffer.find()

        res.render('admin/catagoryOffer', { catagories, catagoryOffer })
    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.saveCatagoryOffer = async (req, res) => {
    try {
        const { categoryType, catagoryOffer, validity } = req.body


        const newCatagoryOffer = new CatagoryOffer({
            catagoryName: categoryType,
            offer: catagoryOffer,
            validity: validity
        })

        newCatagoryOffer.save()

        res.redirect('/admin/catagoryOffer')
    } catch (error) {
        res.render('admin/admin404')
    }
}
exports.deleteCatagoryOffer = async (req, res) => {
    try {
        let id = req.query.id
        await CatagoryOffer.deleteOne({ _id: id })
        res.redirect('/admin/catagoryOffer')
    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.productOffer = async (req, res) => {
    try {
        const products = await Product.find()

        const productOffer = await ProductOffer.find()

        res.render('admin/productOffer', { products, productOffer })
    } catch (error) {
        res.render('admin/admin404')
    }
}


exports.saveProductOffer = async (req, res) => {
    try {
        const { productName, productOffer, validity } = req.body


        const newProductOffer = new ProductOffer({
            productName: productName,
            offer: productOffer,
            validity: validity
        })

        newProductOffer.save()

        res.redirect('/admin/productOffer')
    } catch (error) {
        res.render('admin/admin404')
    }
}



exports.deleteProductOffer = async (req, res) => {
    try {
        let id = req.query.id
        await ProductOffer.deleteOne({ _id: id })
        res.redirect('/admin/productOffer')
    } catch (error) {
        res.render('admin/admin404')
    }
}



exports.coupon = async (req, res) => {
    try {
        const coupons = await Coupon.find()
        if (!coupons) {
            return res.render('admin/coupon', { coupons: [] })
        }
        res.render('admin/coupons', { coupons })
    } catch (error) {
        res.render('admin/admin404')
    }
}

exports.saveCoupon = async (req, res) => {
    try {
        const { code, couponDiscount, validity } = req.body
        const today = new Date()
    
        const existing = await Coupon.findOne({ code: code })
    
        if (existing) {
           return res.json({ success: false })
        }
    
        const coupon = new Coupon({
            code,
            offer: couponDiscount,
            validity
        })
    
        coupon.save()
    
        res.json({ success:true })
        
    } catch (error) {
        res.render('admin/admin404')
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
        let id = req.query.id
        await Coupon.deleteOne({ _id: id })
        res.redirect('/admin/coupons')
        
    } catch (error) {
        res.render('admin/admin404')  
    }
}
const Catagory = require("../../model/catagoryModel")
const CatagoryOffer = require("../../model/offerModel")
const Product = require("../../model/productModel")
const ProductOffer = require("../../model/productOfferModel")
const Referal = require("../../model/referalModel")


exports.referal = async (req, res) => {
    const referal = await Referal.find()
    if (!referal) {
        res.render('admin/referalOffer', { referal: [] })
    }
    res.render('admin/referalOffer', { referal })
}


exports.saveReferal = async (req, res) => {
    const { referralOffer, referredOffer, validity } = req.body

    const newDate = new Date(validity)

    const referal = new Referal({
        referalOffer: referralOffer,
        referedOffer: referredOffer,
        Validity: newDate
    })
    referal.save()

    res.redirect('/admin/referalOffer')
}


exports.deleteReferal = async (req, res) => {
    const referalId = req.query.id

    await Referal.deleteOne({ _id: referalId })

    res.redirect('/admin/referalOffer')
}


exports.catagoryOffer = async (req, res) => {
    try {
        const catagories = await Catagory.find({isActive:true})

        const catagoryOffer = await CatagoryOffer.find()

        res.render('admin/catagoryOffer', { catagories, catagoryOffer })
    } catch (error) {

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

    }
}
exports.deleteCatagoryOffer = async (req, res) => {
    try {
        let id = req.query.id       
        await CatagoryOffer.deleteOne({ _id: id })
        res.redirect('/admin/catagoryOffer')
    } catch (error) {

    }
}


exports.productOffer = async (req, res) => {
    try {
        const products = await Product.find()
        console.log(products);
        const productOffer = await ProductOffer.find()

        res.render('admin/productOffer', { products, productOffer })
    } catch (error) {

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

    }
}
exports.deleteProductOffer = async (req, res) => {
    try {
        let id = req.query.id       
        await ProductOffer.deleteOne({ _id: id })
        res.redirect('/admin/productOffer')
    } catch (error) {

    }
}
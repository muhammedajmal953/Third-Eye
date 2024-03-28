const Catagory = require("../../model/catagoryModel")
const CatagoryOffer = require("../../model/offerModel")
const Referal = require("../../model/referalModel")


exports.referal = async (req, res) => {
    const referal=await Referal.find()
    if (!referal) {
        res.render('admin/referalOffer',{referal:[]})
    }
    res.render('admin/referalOffer',{referal})
}


exports.saveReferal = async (req, res)=>{
    const { referralOffer, referredOffer, validity } = req.body
    
    const newDate = new Date(validity)
    
    const referal = new Referal({
        referalOffer:referralOffer,
        referedOffer:referredOffer,
        Validity:newDate
    })
    referal.save()

    res.redirect('/admin/referalOffer')
}


exports.deleteReferal =async (req,res) => {
    const referalId = req.query.id
    
    await Referal.deleteOne({ _id: referalId })
    
    res.redirect('/admin/referalOffer')
}


exports.catagoryOffer = async (req, res) => {
    try {
        const catagories = await Catagory.find()

        const catagoryOffer=await CatagoryOffer.find({}).populate('catagoryId','catagoryName')
        
        console.log(catagoryOffer);
        
        res.render('admin/catagoryOffer',{catagories,catagoryOffer})
    } catch (error) {
        
    }
}


exports.saveCatagoryOffer = async (req, res) => {
    try {
        const { categoryType, catagoryOffer, validity } = req.body
        console.log(validity);
       
        const newCatagoryOffer = new CatagoryOffer({
            catagoryId: categoryType,
            offer: catagoryOffer,
            validity:validity
        })

        newCatagoryOffer.save()

        res.redirect('/admin/catagoryOffer')
    } catch (error) {
        
    }
}
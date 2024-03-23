const Catagory = require("../../model/catagoryModel");
const sharp = require("sharp");


//add catagory
exports.add_catagory = async (req, res) => {
    try {
      const existingCat = await Catagory.findOne({
        catagoryName: req.body.catagoryName,
      });
      if (existingCat) {
        return res.render("./admin/addCatagory", {
          message: "catagory already exist",
        });
      }
  
      // adding catagory to data base
      let imageUrl;
      console.log(req.file.path);
      const imageBuffer = await sharp(req.file.path)
        .resize({ width: 400, height: 500, fit: sharp.fit.cover })
        .toBuffer();
      const filename = `cropped_${req.file.originalname}`;

      imageUrl = filename;
  
      await sharp(imageBuffer).toFile(`./uploads/catagory/${filename}`);
  
      const addCatagory = new Catagory({
        catagoryName: req.body.catagoryName,
        image: imageUrl,
        isActive: true,
      });
  
      await addCatagory.save();
      //redirect to catagory list page after adding
      res.redirect("/admin/catagory");
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  

  
//editing catagory
exports.edit_catagory = async (req, res) => {
    try {
      // Check if a file was uploaded and set the image URL accordingly
      let imageUrl;
  
      if (req.file) {
        const imageBuffer = await sharp(req.file.path)
          .resize({ width: 400, height: 500, fit: sharp.fit.cover })
          .toBuffer();
        const filename = `cropped_${req.file.originalname}`;
        imageUrl = filename;
        await sharp(imageBuffer).toFile(`./uploads/catagory/${filename}`);
      }
  
      const existingCatagory = await Catagory.findOne({
        catagoryName: req.body.catagoryName,
      });
  
      const existingId = new ObjectId(req.params.id);
      const catag = await Catagory.findOne({ _id: req.params.id });
      if (existingCatagory && existingCatagory._id != req.params.id) {
        return res.render("./admin/editCatagory", {
          message: "Name already exist",
          catag: catag,
        });
      }
      // Update the category in the database
      await Catagory.findByIdAndUpdate(
        { _id: req.params.id },
        {
          catagoryName: req.body.catagoryName,
          image: imageUrl,
          isActive: true,
        }
      );
  
      // Redirect to the categories page after successful update
      res.redirect("/admin/catagory");
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error editing category:", error);
      res.status(500).send("error of eddting catagory");
    }
};
  


// Remove category
exports.remove_catagory = async (req, res) => {
    try {
      // Update the category to mark it as inactive
      await Catagory.updateOne(
        { _id: req.query.id },
        {
          isActive: false,
        }
      );
      // Redirect to the categories page
      res.redirect("/admin/catagory");
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error removing category:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // Restore category
  exports.unRemove_catagory = async (req, res) => {
    try {
      // Update the category to mark it as active
      await Catagory.updateOne(
        { _id: req.query.id },
        {
          isActive: true,
        }
      );
      // Redirect to the unlisted categories page
      res.redirect("/admin/unlisted-catagory");
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error restoring category:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
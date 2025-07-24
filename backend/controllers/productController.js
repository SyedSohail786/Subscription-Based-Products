const Category = require("../models/Category");
const Product = require("../models/Product");

// ✅ Get single product
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// ✅ Create product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      category,
      subcategory,
      price,
      tags,
      author,
      releaseDate,
      returnAvailable,
      about,
    } = req.body;

    const fileUrl = req.files?.file?.[0]?.path;
    const imageUrl = req.files?.image?.[0]?.path;

    if (
      !title ||
      !shortDescription ||
      !category ||
      !subcategory ||
      !price ||
      !tags ||
      !author ||
      !releaseDate ||
      !about
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      title,
      shortDescription,
      category,
      subcategory,
      price,
      tags: typeof tags === "string" ? tags.split(",") : tags,
      author,
      releaseDate,
      returnAvailable: returnAvailable === 'true' || returnAvailable === true,
      about,
      fileUrl,
      imageUrl,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};





// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      subcategory,
      price, 
      tags,
      about,
      author,
      releaseDate,
      returnAvailable,
      shortDescription
    } = req.body;

    const fileUrl = req.files?.file?.[0]?.path;
    const imageUrl = req.files?.image?.[0]?.path;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.title = title || product.title;
    product.description = description || product.description;
    product.shortDescription = shortDescription || product.shortDescription;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.price = price || product.price;
    product.tags = tags ? JSON.parse(tags) : product.tags;
    product.about = about || product.about;
    product.author = author || product.author;
    product.releaseDate = releaseDate || product.releaseDate;
    product.returnAvailable = returnAvailable === 'true' || product.returnAvailable;
    
    // Only update file/image URLs if new files were uploaded
    if (fileUrl) {
      product.fileUrl = fileUrl;
    }
    if (imageUrl) {
      product.imageUrl = imageUrl;
    }

    const updatedProduct = await product.save();
    
    res.json({
      ...updatedProduct._doc,
      fileUrl: updatedProduct.fileUrl ? updatedProduct.fileUrl : undefined,
      imageUrl: updatedProduct.imageUrl ? updatedProduct.imageUrl : undefined
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
 
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted successfully" });
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, min, max, type, sortBy, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json({ products: [], totalPages: 0 });
      }
    }

    // Tags filter
    if (type) {
      query.tags = { $in: [type] };
    }

    // Price filter
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = parseFloat(min);
      if (max) query.price.$lte = parseFloat(max);
    }

    const sortOption = sortBy === "name" ? { title: 1 } : { createdAt: -1 };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("category");

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ products, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



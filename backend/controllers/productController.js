const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Get average rating and review count
    const comments = await Comment.find({ product: req.params.id });
    const averageRating = comments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (comments.length || 1);
    const reviewCount = comments.length;

    res.json({
      ...product.toObject(),
      averageRating: averageRating.toFixed(1),
      reviewCount
    });
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ message: "Server error" });
  }
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
      tagsInput,
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
      !tagsInput ||
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
      tags: typeof tagsInput === "string" ? tagsInput.split(",") : tagsInput,
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
    
    const { 
      search, 
      category, 
      subcategory, 
      min, 
      max, 
      type, 
      sortBy = 'latest', 
      page = 1, 
      limit = 10,
      ratingMin
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter - case insensitive
    if (category) {
      const categoryRegex = new RegExp(`^${category}$`, 'i');
      const categoryDoc = await Category.findOne({ name: { $regex: categoryRegex } });

      if (categoryDoc) {
        query.category = categoryDoc._id;
        
        // Subcategory filter - case insensitive if needed
        if (subcategory) {
          query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
        } else if (categoryDoc.subcategories) {
          query.subcategory = { $in: categoryDoc.subcategories };
        }
      } else {
        return res.status(200).json({ products: [], totalPages: 0 });
      }
    }

    // Type filter (matches against tags array)
    if (type) {
      query.tags = { $regex: new RegExp(`^${type}$`, 'i') };
    }

    // Price filter
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = parseFloat(min);
      if (max) query.price.$lte = parseFloat(max);
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default
    switch(sortBy) {
      case 'name':
        sortOption = { title: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
    }

    // Count total matching documents
    const total = await Product.countDocuments(query);

    // Get paginated results
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("category", "name");

    // Get ratings for each product
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const comments = await Comment.find({ product: product._id });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = comments.length > 0 
          ? (totalRating / comments.length).toFixed(1) 
          : "0.0";
        const reviewCount = comments.length;

        return {
          ...product.toObject(),
          averageRating,
          reviewCount
        };
      })
    );

    // Apply rating filter if specified
    const filteredProducts = ratingMin
      ? productsWithRatings.filter(p => parseFloat(p.averageRating) >= parseFloat(ratingMin))
      : productsWithRatings;

    const totalPages = Math.ceil(filteredProducts.length / limit);

    // Apply pagination to filtered results
    const paginatedProducts = filteredProducts.slice(
      (page - 1) * limit,
      page * limit
    );

    res.status(200).json({ 
      products: paginatedProducts, 
      totalPages,
      currentPage: parseInt(page),
      totalProducts: filteredProducts.length
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ 
      message: "Server Error",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.recentlyViewed =async (req, res) => {
  const user = await User.findById(req.user.id);
  user.recentlyViewed = [req.body.productId, ...user.recentlyViewed.filter(id => id !== req.body.productId)].slice(0, 10);
  await user.save();
  res.sendStatus(200);
}

exports.getRecentlyViewed = async (req, res) => {
  const user = await User.findById(req.user.id).populate('recentlyViewed');
  res.json({ products: user.recentlyViewed });
}


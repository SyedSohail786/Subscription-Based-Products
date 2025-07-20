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
    const { title, description, category, price, tags } = req.body;
    const fileUrl = req.files?.file?.[0]?.path;
    const imageUrl = req.files?.image?.[0]?.path;
    console.log(title, description, category, price, tags)
    if (!title || !description || !category || !price || !tags) {
      return res.status(400).json({ message: "All fields are required" });
    }



    const product = new Product({
      title,
      description,
      category,
      price,
      tags: typeof tags === 'string' ? tags.split(',') : tags,
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
  const { title, description, category, price, tags } = req.body;

  const fileUrl = req.files?.file?.[0]?.path;
  const imageUrl = req.files?.image?.[0]?.path;

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.title = title || product.title;
  product.description = description || product.description;
  product.category = category || product.category;
  product.price = price || product.price;
  product.tags = tags || product.tags;
  product.fileUrl = fileUrl || product.fileUrl;
  product.imageUrl = imageUrl || product.imageUrl;

  const updated = await product.save();
  res.json(updated);
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
    const { search, category, min, max, type } = req.query;

    const query = {};

    // 🔍 Search filter (title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 📚 Category filter (convert name to ObjectId)
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // No matching category found — return empty array
        return res.status(200).json([]);
      }
    }

    // 🏷️ Tags/type filter
    if (type) {
      query.tags = { $in: [type] }; // Assuming `tags` is an array of strings
    }

    // 💰 Price filter
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = parseFloat(min);
      if (max) query.price.$lte = parseFloat(max);
    }

    const products = await Product.find(query).populate("category"); // Optional populate
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

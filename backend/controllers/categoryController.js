const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: "Category already exists" });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

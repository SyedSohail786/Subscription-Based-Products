const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const cleanedSubcategories = Array.isArray(subcategories)
      ? subcategories.map(sub => sub.trim()).filter(Boolean)
      : [];

    const category = await Category.create({
      name: name.trim(),
      subcategories: cleanedSubcategories,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("createCategory error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const { id } = req.params;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category with same name already exists (excluding current category)
    const exists = await Category.findOne({ 
      name: name.trim(), 
      _id: { $ne: id } 
    });
    if (exists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // Process subcategories
    const cleanedSubcategories = Array.isArray(subcategories)
      ? subcategories.map(sub => sub.trim()).filter(Boolean)
      : [];

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        subcategories: cleanedSubcategories
      },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

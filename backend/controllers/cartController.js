const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const existingItem = cart.items.find(item => item.product == productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ product: productId });
      }
      await cart.save();
    } else {
      cart = await Cart.create({ user: userId, items: [{ product: productId }] });
    }

    res.status(200).json({ message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

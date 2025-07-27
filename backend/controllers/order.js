const Download = require('../models/Download');
const Order = require('../models/Order');

exports.getMyOrders = async (req, res) => {
     try {
       const orders = await Order.find({ user: req.userId })
         .sort({ createdAt: -1 })
         .populate('product', 'title imageUrl fileUrl');
       // Format the response to include product details
       const formattedOrders = orders.map(order => ({
         ...order._doc,
         productDetails: {
           title: order.productDetails.title,
           imageUrl: order.productDetails.imageUrl,
           fileUrl: order.productDetails.fileUrl
         }
       }));
   
       res.json(formattedOrders);
     } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Server Error' });
     }
   }


   exports.checkProductPurchase = async (req, res) => {
     try {
       const { productId } = req.params;
       const userId = req.user._id;
       const downloadUserId = await Download.findOne({ user: userId, product: productId });
       if (downloadUserId) {
        return res.json({ hasPurchased: true });
       }
   
       // Check if there's a completed order for this user and product
       const order = await Order.findOne({
         user: userId,
         product: productId,
         status: "completed"
       });
   
       res.json({ hasPurchased: !!order });
     } catch (error) {
       console.error("Error checking purchase:", error);
       res.status(500).json({ error: "Internal server error" });
     }
   };
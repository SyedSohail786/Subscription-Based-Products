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
           title: order.product.title,
           imageUrl: order.product.imageUrl,
           fileUrl: order.product.fileUrl
         }
       }));
   
       res.json(formattedOrders);
     } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Server Error' });
     }
   }
// routes/admin.js
router.get("/dashboard/analytics", isAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalRevenue = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalSubscriptions = await Subscription.countDocuments();

  const topProducts = await Download.aggregate([
    { $group: { _id: "$product", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);

  res.json({
    totalUsers,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalSubscriptions,
    topProducts,
  });
});

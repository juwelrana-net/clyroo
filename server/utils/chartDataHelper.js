// server/utils/chartDataHelper.js

// --- YEH LINE HATA DEIN ---
// const Order = require("../models/Order");
// --- HATA DIYA ---

// Helper function 1: Date range generate karein
const getDaysArray = (start, end) => {
  let arr = [];
  for (
    let dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr;
};

// Helper function 2: Date ko 'Nov 15' format mein badlein
const formatDateForChart = (date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// --- YEH LINE UPDATE KAREIN ---
// Main function jo data fetch aur format karega
// Ab yeh 'Order' ko as a parameter lega
const getChartData = async (Order, range) => {
  // --- UPDATE KHATAM ---

  // 1. Date Range set karein
  const now = new Date();
  let startDate = new Date();
  if (range === "7days") {
    startDate.setDate(now.getDate() - 7);
  } else if (range === "yesterday") {
    startDate.setDate(now.getDate() - 1);
    startDate.setHours(0, 0, 0, 0); // Kal subah 12 baje
  } else {
    // Default 30 days
    startDate.setDate(now.getDate() - 30);
  }

  if (range === "yesterday") {
    // Sirf "yesterday" ke liye logic
    const yesterday = new Date(startDate);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // 'Order' model (jo parameter se mila) ka istemal karein
    const dbData = await Order.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: { $gte: yesterday, $lt: today },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$priceAtPurchase" },
          totalSales: { $sum: 1 },
        },
      },
    ]);

    return [
      {
        name: formatDateForChart(yesterday),
        revenue: dbData[0]?.totalRevenue || 0,
        sales: dbData[0]?.totalSales || 0,
      },
    ];
  }

  // 'alltime' ke liye alag logic (monthly basis)
  if (range === "alltime") {
    const dbData = await Order.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by month
          totalRevenue: { $sum: "$priceAtPurchase" },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return dbData.map((item) => ({
      name: item._id, // '2025-11'
      revenue: item.totalRevenue,
      sales: item.totalSales,
    }));
  }

  // 7-days aur 30-days ke liye logic

  // 2. Database se data fetch karein
  const dbData = await Order.aggregate([
    { $match: { status: "Completed", createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$priceAtPurchase" },
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3. Database data ko ek Map mein convert karein
  const dataMap = new Map();
  dbData.forEach((item) => {
    dataMap.set(item._id, item);
  });

  // 4. Poore date range (e.g., 30 din) ki list banayein
  const daysArray = getDaysArray(startDate, now);

  // 5. Final chart data banayein
  const finalChartData = daysArray.map((date) => {
    const dateString = date.toISOString().split("T")[0];
    const dbEntry = dataMap.get(dateString);

    return {
      name: formatDateForChart(date),
      revenue: dbEntry?.totalRevenue || 0,
      sales: dbEntry?.totalSales || 0,
    };
  });

  return finalChartData;
};

module.exports = { getChartData };

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/redis';

// Helper function to get user growth data
async function getUserGrowthData(db: any) {
  try {
    // Get users grouped by month for the last 12 months
    const userGrowth = await db.collection("clients").aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: "$createdAt" } },
            month: { $month: { $toDate: "$createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]).toArray();

    // Format data for chart
    const formattedData = userGrowth.map((item: any) => ({
      name: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      value: item.count
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return [];
  }
}

// Helper function to get revenue by city data
async function getRevenueByCityData(db: any) {
  try {
    // Get payments grouped by station city
    const revenueByCity = await db.collection("payments").aggregate([
      {
        $match: {
          status: "completed"
        }
      },
      {
        $lookup: {
          from: "stations",
          localField: "stationId",
          foreignField: "_id",
          as: "station"
        }
      },
      {
        $unwind: "$station"
      },
      {
        $group: {
          _id: "$station.city",
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
          // Calculate growth by comparing recent vs older payments
          recentRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(new Date().setMonth(new Date().getMonth() - 1))] },
                "$amount",
                0
              ]
            }
          },
          olderRevenue: {
            $sum: {
              $cond: [
                { $lt: ["$createdAt", new Date(new Date().setMonth(new Date().getMonth() - 1))] },
                "$amount",
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          growth: {
            $cond: [
              { $eq: ["$olderRevenue", 0] },
              { $cond: [{ $gt: ["$recentRevenue", 0] }, 100, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$recentRevenue", "$olderRevenue"] },
                      "$olderRevenue"
                    ]
                  },
                  100
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          totalRevenue: -1
        }
      },
      {
        $limit: 10 // Top 10 cities
      }
    ]).toArray();

    // Format data for chart with actual growth information
    const formattedData = revenueByCity.map((item: any) => ({
      name: item._id || 'Unknown',
      value: item.totalRevenue,
      growth: Math.round(item.growth)
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching revenue by city data:", error);
    return [];
  }
}

// Helper function to get user and charging usage by city
async function getUserAndChargingUsageByCity(db: any) {
  try {
    // Get stations grouped by city with user and charging session counts
    const cityData = await db.collection("stations").aggregate([
      {
        $group: {
          _id: "$city",
          stationCount: { $sum: 1 },
          totalSlots: { $sum: { $size: "$slots" } }
        }
      },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "city", // Changed from "location" to "city" for consistency
          as: "users"
        }
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "stationCity",
          as: "bookings"
        }
      },
      {
        $project: {
          city: "$_id",
          users: { $size: "$users" },
          chargingSessions: { $size: "$bookings" },
          stations: "$stationCount",
          slots: "$totalSlots"
        }
      },
      {
        $sort: {
          users: -1
        }
      },
      {
        $limit: 10 // Top 10 cities
      }
    ]).toArray();

    // Format data for chart
    const formattedData = cityData.map((item: any) => ({
      name: item.city || 'Unknown',
      users: item.users,
      chargingSessions: item.chargingSessions
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching user and charging usage by city:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chartType = searchParams.get('type');

    // Try to get from Redis cache first
    if (redis.isAvailable()) {
      try {
        const cacheKey = `chart-data:${chartType || 'all'}`;
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
          console.log(`Returning cached chart data for type: ${chartType}`);
          return NextResponse.json(JSON.parse(cachedData));
        }
      } catch (redisError) {
        console.error("Error fetching chart data from Redis:", redisError);
      }
    }

    const { db } = await connectToDatabase();
    
    let chartData: any = {};

    if (!chartType || chartType === 'user-growth') {
      chartData.userGrowth = await getUserGrowthData(db);
    }

    if (!chartType || chartType === 'revenue-by-city') {
      chartData.revenueByCity = await getRevenueByCityData(db);
    }

    if (!chartType || chartType === 'usage-by-city') {
      chartData.usageByCity = await getUserAndChargingUsageByCity(db);
    }

    // Cache in Redis for 5 minutes
    if (redis.isAvailable()) {
      try {
        const cacheKey = `chart-data:${chartType || 'all'}`;
        await redis.setex(cacheKey, 300, JSON.stringify(chartData));
      } catch (redisError) {
        console.error("Error caching chart data in Redis:", redisError);
      }
    }

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" }, 
      { status: 500 }
    );
  }
}
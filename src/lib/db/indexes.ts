import { connectToDatabase } from '@/lib/db/connection';
import { createOptimizedIndexes } from '@/lib/db/queryOptimizer';

/**
 * Ensure proper database indexes are created for optimal performance
 * This should be called during application startup
 */
export async function ensureDatabaseIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    // Create basic indexes for all collections
    await createBasicIndexes(db);
    
    // Create optimized indexes for common query patterns
    await createOptimizedIndexes(db);
    
    console.log('✅ All database indexes created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    return false;
  }
}

/**
 * Create basic indexes for all collections
 */
async function createBasicIndexes(db: any) {
  // Create indexes for clients collection
  await db.collection('clients').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { googleId: 1 }, unique: true, sparse: true },
    { key: { role: 1 } },
    { key: { createdAt: 1 } },
    { key: { lastLogin: 1 } }
  ]);
  console.log('✅ Created basic indexes for clients collection');
  
  // Create indexes for payments collection
  await db.collection('payments').createIndexes([
    { key: { userId: 1 } }, // Critical for user-specific queries
    { key: { orderId: 1 }, unique: true },
    { key: { paymentId: 1 }, unique: true, sparse: true },
    { key: { status: 1 } },
    { key: { createdAt: -1 } }, // Descending for most recent first
    { key: { stationId: 1 } }
  ]);
  console.log('✅ Created basic indexes for payments collection');
  
  // Create indexes for charging_sessions collection
  await db.collection('charging_sessions').createIndexes([
    { key: { userId: 1 } }, // Critical for user-specific queries
    { key: { stationId: 1 } },
    { key: { status: 1 } },
    { key: { startTime: -1 } }, // Descending for most recent first
    { key: { endTime: -1 } },
    { key: { createdAt: -1 } }
  ]);
  console.log('✅ Created basic indexes for charging_sessions collection');
  
  // Create indexes for stations collection
  await db.collection('stations').createIndexes([
    { key: { status: 1 } },
    { key: { location: 1 } },
    { key: { createdAt: 1 } },
    { key: { city: 1 } },
    { key: { "slots.status": 1 } } // For querying slot availability
  ]);
  console.log('✅ Created basic indexes for stations collection');
  
  // Create indexes for admins collection
  await db.collection('admins').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { role: 1 } },
    { key: { createdAt: 1 } }
  ]);
  console.log('✅ Created basic indexes for admins collection');
  
  // Create indexes for accounts collection
  await db.collection('accounts').createIndexes([
    { key: { userId: 1 } },
    { key: { provider: 1 } },
    { key: { providerAccountId: 1 } }
  ]);
  console.log('✅ Created basic indexes for accounts collection');
  
  // Create indexes for bookings collection (if it exists)
  try {
    await db.collection('bookings').createIndexes([
      { key: { userId: 1 } },
      { key: { stationId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ Created basic indexes for bookings collection');
  } catch (error) {
    console.log('⚠️  Bookings collection may not exist yet, skipping indexes');
  }
  
  // Create indexes for eco_stats collection (if it exists)
  try {
    await db.collection('eco_stats').createIndexes([
      { key: { date: -1 } }, // For recent stats
      { key: { type: 1 } }
    ]);
    console.log('✅ Created basic indexes for eco_stats collection');
  } catch (error) {
    console.log('⚠️  Eco stats collection may not exist yet, skipping indexes');
  }
}
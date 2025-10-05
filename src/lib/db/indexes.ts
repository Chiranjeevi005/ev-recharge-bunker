import { connectToDatabase } from '@/lib/db/connection';

/**
 * Ensure proper database indexes are created for optimal performance
 * This should be called during application startup
 */
export async function ensureDatabaseIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    // Create indexes for clients collection
    await db.collection('clients').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { googleId: 1 }, unique: true, sparse: true },
      { key: { role: 1 } },
      { key: { createdAt: 1 } },
      { key: { lastLogin: 1 } }
    ]);
    console.log('✅ Created indexes for clients collection');
    
    // Create indexes for payments collection
    await db.collection('payments').createIndexes([
      { key: { userId: 1 } }, // Critical for user-specific queries
      { key: { orderId: 1 }, unique: true },
      { key: { paymentId: 1 }, unique: true, sparse: true },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }, // Descending for most recent first
      { key: { stationId: 1 } }
    ]);
    console.log('✅ Created indexes for payments collection');
    
    // Create indexes for sessions collection
    await db.collection('sessions').createIndexes([
      { key: { userId: 1 } }, // Critical for user-specific queries
      { key: { stationId: 1 } },
      { key: { status: 1 } },
      { key: { startTime: -1 } }, // Descending for most recent first
      { key: { endTime: -1 } }
    ]);
    console.log('✅ Created indexes for sessions collection');
    
    // Create indexes for stations collection
    await db.collection('stations').createIndexes([
      { key: { status: 1 } },
      { key: { location: 1 } },
      { key: { createdAt: 1 } }
    ]);
    console.log('✅ Created indexes for stations collection');
    
    // Create indexes for admins collection
    await db.collection('admins').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: 1 } }
    ]);
    console.log('✅ Created indexes for admins collection');
    
    // Create indexes for accounts collection
    await db.collection('accounts').createIndexes([
      { key: { userId: 1 } },
      { key: { provider: 1 } },
      { key: { providerAccountId: 1 } }
    ]);
    console.log('✅ Created indexes for accounts collection');
    
    console.log('✅ All database indexes created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    return false;
  }
}
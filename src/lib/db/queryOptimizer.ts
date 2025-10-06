import { Db, Collection } from 'mongodb';

/**
 * Query optimization utilities for MongoDB operations
 */

/**
 * Optimized pagination helper that uses estimatedDocumentCount when possible
 * for better performance on large collections
 */
export async function optimizedPagination(
  collection: Collection,
  filter: any,
  options: {
    page: number;
    limit: number;
    sort?: any;
    projection?: any;
  }
) {
  const { page, limit, sort, projection } = options;
  const skip = (page - 1) * limit;
  
  // Use projection to limit fields returned
  let query = collection.find(filter);
  if (projection) {
    query = query.project(projection);
  }
  
  // Apply sorting
  if (sort) {
    query = query.sort(sort);
  }
  
  // Apply pagination
  const items = await query.skip(skip).limit(limit).toArray();
  
  // Use estimatedDocumentCount for better performance when no filters
  const total = Object.keys(filter).length === 0 
    ? await collection.estimatedDocumentCount()
    : await collection.countDocuments(filter);
  
  return {
    items,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Optimized findOne with projection
 */
export async function optimizedFindOne(
  collection: Collection,
  filter: any,
  projection?: any
) {
  const query = collection.find(filter);
  if (projection) {
    query.project(projection);
  }
  return await query.limit(1).next();
}

/**
 * Optimized exists check that only fetches the _id field
 */
export async function optimizedExists(
  collection: Collection,
  filter: any
): Promise<boolean> {
  const result = await collection.findOne(filter, { projection: { _id: 1 } });
  return result !== null;
}

/**
 * Batch insert helper for better performance when inserting multiple documents
 */
export async function batchInsert(
  collection: Collection,
  documents: any[],
  batchSize: number = 100
) {
  const results = [];
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const result = await collection.insertMany(batch);
    results.push(result);
  }
  return results;
}

/**
 * Create optimized indexes for common query patterns
 */
export async function createOptimizedIndexes(db: Db) {
  try {
    // Compound indexes for common query patterns
    await db.collection('clients').createIndexes([
      { key: { role: 1, status: 1 }, name: 'role_status_idx' },
      { key: { createdAt: -1, role: 1 }, name: 'created_role_idx' }
    ]);
    
    await db.collection('payments').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'user_created_idx' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created_idx' },
      { key: { stationId: 1, userId: 1 }, name: 'station_user_idx' }
    ]);
    
    await db.collection('charging_sessions').createIndexes([
      { key: { userId: 1, status: 1 }, name: 'user_status_idx' },
      { key: { stationId: 1, status: 1 }, name: 'station_status_idx' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_created_idx' }
    ]);
    
    await db.collection('stations').createIndexes([
      { key: { city: 1, status: 1 }, name: 'city_status_idx' },
      { key: { location: '2dsphere' }, name: 'location_2dsphere_idx' }
    ]);
    
    console.log('✅ Optimized indexes created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating optimized indexes:', error);
    return false;
  }
}

export default {
  optimizedPagination,
  optimizedFindOne,
  optimizedExists,
  batchInsert,
  createOptimizedIndexes
};
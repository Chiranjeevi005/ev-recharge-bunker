import type { NextApiRequest, NextApiResponse } from 'next';
import type { ClientSession } from 'mongodb';
import { executeTransaction } from '../../../lib/db/transaction';
import { connectToDatabase } from '../../../lib/db/connection';

/**
 * API route for updating user profile with transaction safety
 * This example shows how to atomically update multiple collections
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get request data
    const { userId, profileData, preferences } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Execute the profile update in a transaction
    const result = await executeTransaction(async (session: ClientSession) => {
      // Get database connection
      const { db } = await connectToDatabase();
      
      // Update user profile collection
      const profileUpdate = await db.collection('users').updateOne(
        { _id: userId },
        { 
          $set: { 
            ...profileData,
            updatedAt: new Date() 
          } 
        },
        { session }
      );
      
      // Update user preferences collection if provided
      let preferencesUpdate;
      if (preferences) {
        preferencesUpdate = await db.collection('userPreferences').updateOne(
          { userId },
          { 
            $set: { 
              ...preferences,
              updatedAt: new Date() 
            } 
          },
          { session, upsert: true }
        );
      }
      
      // Log the update operation
      await db.collection('auditLogs').insertOne({
        userId,
        action: 'profile_update',
        timestamp: new Date(),
        details: {
          profileFields: Object.keys(profileData || {}),
          preferencesFields: preferences ? Object.keys(preferences) : []
        }
      }, { session });
      
      return {
        success: true,
        profileModified: profileUpdate.modifiedCount,
        preferencesModified: preferencesUpdate?.modifiedCount || 0
      };
    });
    
    // Return success response
    return res.status(200).json(result);
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Gateway Timeout', 
        message: 'The request timed out while processing' 
      });
    }
    
    // Generic error response
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to update profile' 
    });
  }
}
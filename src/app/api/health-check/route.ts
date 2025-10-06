import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import redis from '@/lib/realtime/redisQueue';
import logger from '@/lib/logging';
import { createAlert, getActiveAlerts } from '@/lib/monitoring/alerts';

interface HealthCheckResult {
  status: 'ok' | 'warning' | 'error';
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message?: string;
    };
    redis: {
      status: 'ok' | 'error';
      message?: string;
    };
    application: {
      status: 'ok' | 'error';
      message?: string;
    };
  };
  alerts?: any[];
}

export async function GET() {
  try {
    const result: HealthCheckResult = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'ok' },
        redis: { status: 'ok' },
        application: { status: 'ok' }
      }
    };
    
    // Check database connectivity
    try {
      const { db } = await connectToDatabase();
      await db.listCollections().toArray();
      logger.debug('Database health check passed');
    } catch (error) {
      result.checks.database.status = 'error';
      result.checks.database.message = error instanceof Error ? error.message : 'Unknown database error';
      result.status = 'error';
      logger.error('Database health check failed', error);
      
      createAlert('critical', 'Database Connectivity Issue', 
        `Database connection failed: ${result.checks.database.message}`);
    }
    
    // Check Redis connectivity
    try {
      if (redis.isAvailable()) {
        logger.debug('Redis health check passed');
      } else {
        throw new Error('Redis is not available');
      }
    } catch (error) {
      result.checks.redis.status = 'error';
      result.checks.redis.message = error instanceof Error ? error.message : 'Unknown Redis error';
      result.status = result.status === 'ok' ? 'warning' : result.status;
      logger.error('Redis health check failed', error);
      
      createAlert('warning', 'Redis Connectivity Issue', 
        `Redis connection failed: ${result.checks.redis.message}`);
    }
    
    // Check application status
    try {
      // Add any application-specific health checks here
      logger.debug('Application health check passed');
    } catch (error) {
      result.checks.application.status = 'error';
      result.checks.application.message = error instanceof Error ? error.message : 'Unknown application error';
      result.status = 'error';
      logger.error('Application health check failed', error);
      
      createAlert('critical', 'Application Issue', 
        `Application health check failed: ${result.checks.application.message}`);
    }
    
    // Add active alerts to the response
    result.alerts = getActiveAlerts();
    
    // Set appropriate status code
    const statusCode = result.status === 'ok' ? 200 : 
                      result.status === 'warning' ? 200 : 500;
    
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    logger.error('Health check endpoint failed', error);
    
    createAlert('critical', 'Health Check Endpoint Failure', 
      `Health check endpoint encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        message: 'Health check endpoint failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
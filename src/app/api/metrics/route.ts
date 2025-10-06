import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';

// In-memory metrics storage
const metrics = {
  httpRequestsTotal: 0,
  httpRequestsByStatus: {} as Record<string, number>,
  httpRequestDurationSeconds: [] as number[],
  paymentProcessingTotal: 0,
  paymentProcessingFailures: 0,
  authenticationAttempts: 0,
  authenticationFailures: 0,
};

// Function to record HTTP request metrics
export function recordHttpRequest(statusCode: number, duration: number) {
  metrics.httpRequestsTotal++;
  
  const statusGroup = `${Math.floor(statusCode / 100)}xx`;
  metrics.httpRequestsByStatus[statusGroup] = (metrics.httpRequestsByStatus[statusGroup] || 0) + 1;
  
  metrics.httpRequestDurationSeconds.push(duration);
  
  // Keep only the last 1000 duration measurements
  if (metrics.httpRequestDurationSeconds.length > 1000) {
    metrics.httpRequestDurationSeconds.shift();
  }
}

// Function to record payment metrics
export function recordPaymentAttempt(success: boolean) {
  metrics.paymentProcessingTotal++;
  if (!success) {
    metrics.paymentProcessingFailures++;
  }
}

// Function to record authentication metrics
export function recordAuthenticationAttempt(success: boolean) {
  metrics.authenticationAttempts++;
  if (!success) {
    metrics.authenticationFailures++;
  }
}

// Prometheus metrics formatting
function formatMetricsForPrometheus() {
  let output = '';
  
  // HTTP requests total
  output += '# HELP http_requests_total Total number of HTTP requests\n';
  output += '# TYPE http_requests_total counter\n';
  output += `http_requests_total ${metrics.httpRequestsTotal}\n\n`;
  
  // HTTP requests by status
  output += '# HELP http_requests_by_status Total number of HTTP requests by status code\n';
  output += '# TYPE http_requests_by_status counter\n';
  for (const [status, count] of Object.entries(metrics.httpRequestsByStatus)) {
    output += `http_requests_by_status{status="${status}"} ${count}\n`;
  }
  output += '\n';
  
  // HTTP request duration
  output += '# HELP http_request_duration_seconds HTTP request duration in seconds\n';
  output += '# TYPE http_request_duration_seconds histogram\n';
  for (const duration of metrics.httpRequestDurationSeconds) {
    output += `http_request_duration_seconds_bucket{le="${duration}"} 1\n`;
  }
  output += '\n';
  
  // Payment processing metrics
  output += '# HELP payment_processing_total Total number of payment processing attempts\n';
  output += '# TYPE payment_processing_total counter\n';
  output += `payment_processing_total ${metrics.paymentProcessingTotal}\n\n`;
  
  output += '# HELP payment_processing_failures Total number of payment processing failures\n';
  output += '# TYPE payment_processing_failures counter\n';
  output += `payment_processing_failures ${metrics.paymentProcessingFailures}\n\n`;
  
  // Authentication metrics
  output += '# HELP authentication_attempts Total number of authentication attempts\n';
  output += '# TYPE authentication_attempts counter\n';
  output += `authentication_attempts ${metrics.authenticationAttempts}\n\n`;
  
  output += '# HELP authentication_failures Total number of authentication failures\n';
  output += '# TYPE authentication_failures counter\n';
  output += `authentication_failures ${metrics.authenticationFailures}\n\n`;
  
  return output;
}

export async function GET() {
  try {
    // Get database stats
    const { db } = await connectToDatabase();
    
    // Get collection counts
    const collections = await db.listCollections().toArray();
    const collectionCounts: Record<string, number> = {};
    
    for (const collection of collections) {
      if (collection.name) {
        collectionCounts[collection.name] = await db.collection(collection.name).estimatedDocumentCount();
      }
    }
    
    // Format metrics for Prometheus
    let metricsOutput = formatMetricsForPrometheus();
    
    // Add database metrics
    metricsOutput += '# HELP mongodb_collection_documents Estimated number of documents in each collection\n';
    metricsOutput += '# TYPE mongodb_collection_documents gauge\n';
    for (const [collectionName, count] of Object.entries(collectionCounts)) {
      metricsOutput += `mongodb_collection_documents{collection="${collectionName}"} ${count}\n`;
    }
    
    return new NextResponse(metricsOutput, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
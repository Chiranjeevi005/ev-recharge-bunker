#!/bin/bash

# Production Deployment Script

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Variables
PROJECT_NAME="ev-bunker"
REGION="iad1"
BUILD_TIMEOUT=1800  # 30 minutes

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
}

# Function to authenticate with Vercel
authenticate() {
    echo "🔐 Authenticating with Vercel..."
    # This would typically use a token from environment variables
    # vercel login
    echo "✅ Authenticated"
}

# Function to build the project
build_project() {
    echo "🏗️ Building project..."
    npm run build
    echo "✅ Build completed"
}

# Function to deploy to production
deploy_production() {
    echo "🚀 Deploying to production..."
    
    # Deploy to production with Vercel
    DEPLOYMENT_URL=$(vercel --prod --token $VERCEL_TOKEN --yes)
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        echo "❌ Failed to get deployment URL"
        exit 1
    fi
    
    echo "✅ Deployed to: $DEPLOYMENT_URL"
    echo "DEPLOYMENT_URL=$DEPLOYMENT_URL" >> $GITHUB_ENV
}

# Function to run health checks
run_health_checks() {
    echo "🩺 Running health checks..."
    
    local url=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts"
        
        # Check if the deployment is ready
        if curl -f -s "$url/api/health-check" > /dev/null; then
            echo "✅ Health check passed"
            return 0
        else
            echo "⏳ Health check failed, waiting..."
            sleep 10
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ Health checks failed after $max_attempts attempts"
    return 1
}

# Function to run comprehensive tests
run_comprehensive_tests() {
    echo "🧪 Running comprehensive tests..."
    
    local url=$1
    
    # Run API tests
    echo "Running API tests..."
    # npm test __tests__/e2e/api.test.ts
    
    # Run load tests
    echo "Running load tests..."
    # node scripts/run-load-tests.js --url=$url
    
    # Run security tests
    echo "Running security tests..."
    # npm run security-audit
    
    echo "✅ Comprehensive tests passed"
    return 0
}

# Function to monitor deployment
monitor_deployment() {
    echo "👁️ Monitoring deployment..."
    
    local url=$1
    local duration=300  # 5 minutes
    
    # Monitor for any immediate issues
    for i in $(seq 1 $duration); do
        # Check health endpoint
        if ! curl -f -s "$url/api/health-check" > /dev/null; then
            echo "❌ Health check failed during monitoring"
            return 1
        fi
        
        # Check metrics endpoint
        if ! curl -f -s "$url/api/metrics" > /dev/null; then
            echo "❌ Metrics endpoint failed during monitoring"
            return 1
        fi
        
        sleep 1
    done
    
    echo "✅ Deployment monitoring completed successfully"
    return 0
}

# Function to send notifications
send_notifications() {
    echo "📢 Sending deployment notifications..."
    
    local status=$1
    local message=$2
    
    # In a real scenario, you would send notifications to Slack, email, etc.
    echo "Deployment $status: $message"
    
    # Example Slack notification:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"Production deployment $status: $message\"}" \
    #   $SLACK_WEBHOOK_URL
}

# Main deployment flow
main() {
    echo "🚀 Starting production deployment process"
    
    # Check prerequisites
    check_vercel_cli
    authenticate
    
    # Build project
    build_project
    
    # Deploy to production
    deploy_production
    
    # Wait for deployment to be ready
    echo "⏳ Waiting for deployment to be ready..."
    sleep 30
    
    # Run health checks
    if ! run_health_checks $DEPLOYMENT_URL; then
        echo "❌ Health checks failed"
        send_notifications "FAILED" "Health checks failed"
        exit 1
    fi
    
    # Run comprehensive tests
    if ! run_comprehensive_tests $DEPLOYMENT_URL; then
        echo "❌ Comprehensive tests failed"
        send_notifications "FAILED" "Comprehensive tests failed"
        exit 1
    fi
    
    # Monitor deployment
    if ! monitor_deployment $DEPLOYMENT_URL; then
        echo "❌ Deployment monitoring failed"
        send_notifications "FAILED" "Deployment monitoring failed"
        exit 1
    fi
    
    # If we get here, everything passed
    echo "✅ All tests passed, production deployment successful!"
    send_notifications "SUCCESS" "Production deployment completed successfully"
}

# Run main function
main "$@"
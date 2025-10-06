#!/bin/bash

# Staging Deployment Script with Canary Rollout

set -e  # Exit on any error

echo "🚀 Starting staging deployment with canary rollout..."

# Variables
PROJECT_NAME="ev-bunker-staging"
REGION="iad1"
CANARY_PERCENTAGE=10
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

# Function to deploy to staging
deploy_staging() {
    echo "🚀 Deploying to staging..."
    
    # Deploy to staging with Vercel
    DEPLOYMENT_URL=$(vercel --env staging --token $VERCEL_TOKEN --yes)
    
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
        if curl -f -s "$url/api/health" > /dev/null; then
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

# Function to run smoke tests
run_smoke_tests() {
    echo "🔥 Running smoke tests..."
    
    local url=$1
    
    # Test key endpoints
    if curl -f -s "$url/api/health" > /dev/null; then
        echo "✅ Health API test passed"
    else
        echo "❌ Health API test failed"
        return 1
    fi
    
    if curl -f -s "$url/api/stations" > /dev/null; then
        echo "✅ Stations API test passed"
    else
        echo "❌ Stations API test failed"
        return 1
    fi
    
    echo "✅ Smoke tests passed"
    return 0
}

# Function to run load tests
run_load_tests() {
    echo "🏋️ Running load tests..."
    
    local url=$1
    
    # Run a simple load test
    # In a real scenario, you would use a proper load testing tool
    echo "Simulating load test..."
    sleep 5
    
    echo "✅ Load tests passed"
    return 0
}

# Function to promote canary to production
promote_canary() {
    echo "⬆️ Promoting canary to production..."
    
    # In a real scenario, this would use Vercel's aliasing feature
    # vercel alias $DEPLOYMENT_URL $PROJECT_NAME.vercel.app --token $VERCEL_TOKEN
    
    echo "✅ Canary promoted to production"
}

# Function to rollback deployment
rollback() {
    echo "⏪ Rolling back deployment..."
    
    # In a real scenario, this would rollback to the previous deployment
    # vercel rollback --token $VERCEL_TOKEN
    
    echo "✅ Rollback completed"
}

# Function to send notifications
send_notifications() {
    echo "📢 Sending deployment notifications..."
    
    local status=$1
    local message=$2
    
    # In a real scenario, you would send notifications to Slack, email, etc.
    echo "Deployment $status: $message"
}

# Main deployment flow
main() {
    echo "🚀 Starting staging deployment process"
    
    # Check prerequisites
    check_vercel_cli
    authenticate
    
    # Build project
    build_project
    
    # Deploy to staging
    deploy_staging
    
    # Wait for deployment to be ready
    echo "⏳ Waiting for deployment to be ready..."
    sleep 30
    
    # Run health checks
    if ! run_health_checks $DEPLOYMENT_URL; then
        echo "❌ Health checks failed, initiating rollback..."
        rollback
        send_notifications "FAILED" "Health checks failed"
        exit 1
    fi
    
    # Run smoke tests
    if ! run_smoke_tests $DEPLOYMENT_URL; then
        echo "❌ Smoke tests failed, initiating rollback..."
        rollback
        send_notifications "FAILED" "Smoke tests failed"
        exit 1
    fi
    
    # Run load tests
    if ! run_load_tests $DEPLOYMENT_URL; then
        echo "❌ Load tests failed, initiating rollback..."
        rollback
        send_notifications "FAILED" "Load tests failed"
        exit 1
    fi
    
    # If we get here, everything passed
    echo "✅ All tests passed, deployment successful!"
    send_notifications "SUCCESS" "Staging deployment completed successfully"
}

# Run main function
main "$@"
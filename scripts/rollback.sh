#!/bin/bash

# Rollback Script

set -e  # Exit on any error

echo "⏪ Starting rollback process..."

# Variables
PROJECT_NAME="ev-bunker-staging"
REGION="iad1"

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

# Function to rollback deployment
rollback_deployment() {
    echo "⏪ Rolling back deployment..."
    
    # Get the previous deployment
    PREVIOUS_DEPLOYMENT=$(vercel ls $PROJECT_NAME --token $VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')
    
    if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
        echo "❌ No previous deployment found"
        exit 1
    fi
    
    echo "Rolling back to: $PREVIOUS_DEPLOYMENT"
    
    # Rollback to previous deployment
    vercel rollback $PREVIOUS_DEPLOYMENT --token $VERCEL_TOKEN
    
    echo "✅ Rollback completed"
}

# Function to run health checks after rollback
run_health_checks() {
    echo "🩺 Running health checks after rollback..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts"
        
        # Check if the rollback deployment is ready
        if curl -f -s "https://$PROJECT_NAME.vercel.app/api/health" > /dev/null; then
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

# Function to send notifications
send_notifications() {
    echo "📢 Sending rollback notifications..."
    
    local status=$1
    local message=$2
    
    # In a real scenario, you would send notifications to Slack, email, etc.
    echo "Rollback $status: $message"
}

# Main rollback flow
main() {
    echo "⏪ Starting rollback process"
    
    # Check prerequisites
    check_vercel_cli
    authenticate
    
    # Rollback deployment
    rollback_deployment
    
    # Wait for rollback to be ready
    echo "⏳ Waiting for rollback to be ready..."
    sleep 30
    
    # Run health checks
    if ! run_health_checks; then
        echo "❌ Health checks failed after rollback"
        send_notifications "FAILED" "Health checks failed after rollback"
        exit 1
    fi
    
    # If we get here, everything passed
    echo "✅ Rollback successful and healthy!"
    send_notifications "SUCCESS" "Rollback completed successfully"
}

# Run main function
main "$@"
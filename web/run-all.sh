#!/bin/bash

# LaBrand Web - Run All Projects
# This script runs both admin and brand-portal simultaneously

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}           LaBrand Web - Starting All Projects${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down all projects...${NC}"
    kill 0
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

# Check if node_modules exist, if not install dependencies
check_and_install() {
    local project_dir=$1
    local project_name=$2

    if [ ! -d "$project_dir/node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies for $project_name...${NC}"
        cd "$project_dir" && npm install
        cd "$SCRIPT_DIR"
    fi
}

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
check_and_install "$SCRIPT_DIR/admin" "Admin"
check_and_install "$SCRIPT_DIR/brand-portal" "Brand Portal"
echo ""

# Start Admin (port 3000)
echo -e "${GREEN}Starting Admin Dashboard on http://localhost:3000${NC}"
cd "$SCRIPT_DIR/admin" && npm run dev &
ADMIN_PID=$!

# Small delay to avoid port conflicts
sleep 2

# Start Brand Portal (port 3001)
echo -e "${GREEN}Starting Brand Portal on http://localhost:3001${NC}"
cd "$SCRIPT_DIR/brand-portal" && npm run dev &
BRAND_PID=$!

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Both projects are running:${NC}"
echo -e "  ${BLUE}Admin Dashboard:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Brand Portal:${NC}     http://localhost:3001"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all projects${NC}"
echo ""

# Wait for both processes
wait $ADMIN_PID $BRAND_PID

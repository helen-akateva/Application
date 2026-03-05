#!/bin/sh

# Run seed (fill with test data)
# If data exists - seed will skip automatically
node dist/seed.js || echo "Seed skipped or failed, continuing..."

# Run main server
node dist/main.js

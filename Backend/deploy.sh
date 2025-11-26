#!/bin/bash

# OneTriangle Smart Contract Deployment Script
# This script deploys the contract to OneChain testnet

set -e

echo "🔷 OneTriangle Contract Deployment"
echo "=================================="
echo ""

# Check if one CLI is installed
if ! command -v one &> /dev/null; then
    echo "❌ Error: OneChain CLI not found. Please install it first:"
    echo "cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing"
    echo "mv ~/.cargo/bin/one_chain ~/.cargo/bin/one"
    exit 1
fi

echo "✅ OneChain CLI found"
echo ""

# Check if onechain-testnet environment exists
if ! one client envs | grep -q "onechain-testnet"; then
    echo "⚙️  Setting up OneChain testnet environment..."
    one client new-env --alias onechain-testnet --rpc https://rpc-testnet.onelabs.cc:443
    echo "✅ Environment created"
else
    echo "✅ OneChain testnet environment already exists"
fi

# Switch to onechain-testnet
echo "🔄 Switching to OneChain testnet..."
one client switch --env onechain-testnet

echo ""
echo "📋 Current Configuration:"
one client active-env
one client active-address
echo ""

# Build the contract
echo "🔨 Building contract..."
one move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Ask for confirmation
echo "⚠️  Ready to deploy. This will use gas from your active address."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy
echo "🚀 Deploying contract..."
echo ""

DEPLOY_OUTPUT=$(one client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo ""

# Parse and display important IDs
PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
GAME_VAULT_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("GameVault")) | .objectId')
ADMIN_CAP_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("AdminCap")) | .objectId')

echo "================================================"
echo "📝 SAVE THESE IDs FOR FRONTEND INTEGRATION:"
echo "================================================"
echo ""
echo "Package ID:     $PACKAGE_ID"
echo "GameVault ID:   $GAME_VAULT_ID"
echo "AdminCap ID:    $ADMIN_CAP_ID"
echo ""
echo "================================================"
echo ""

# Save to file
cat > deployment.json << EOF
{
  "network": "onechain-testnet",
  "rpc": "https://rpc-testnet.onelabs.cc:443",
  "packageId": "$PACKAGE_ID",
  "gameVaultId": "$GAME_VAULT_ID",
  "adminCapId": "$ADMIN_CAP_ID",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployedBy": "$(one client active-address)"
}
EOF

echo "💾 Deployment info saved to deployment.json"
echo ""

# Create .env.local for frontend
cat > ../Frontend/.env.local << EOF
# OneTriangle Smart Contract Configuration
# Generated: $(date)

NEXT_PUBLIC_NETWORK=onechain-testnet
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID
NEXT_PUBLIC_GAME_VAULT_ID=$GAME_VAULT_ID
NEXT_PUBLIC_ADMIN_CAP_ID=$ADMIN_CAP_ID
EOF

echo "💾 Frontend .env.local created"
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Verify deployment: one client object $GAME_VAULT_ID"
echo "2. Update frontend with the package and object IDs"
echo "3. Test deposit function with the CLI or frontend"
echo ""

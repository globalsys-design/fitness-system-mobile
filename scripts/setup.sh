#!/bin/bash
# =============================================================================
# Fitness System Mobile — Automated Setup Script
# =============================================================================
# Usage: ./scripts/setup.sh
#
# Prerequisites:
#   - Node.js 20+ installed
#   - Git configured with SSH key for github.com
#   - Accounts created on: Neon, Stripe, Resend, Google Cloud, Vercel
#
# This script will:
#   1. Install dependencies
#   2. Create .env.local from .env.example with your values
#   3. Generate AUTH_SECRET
#   4. Run Prisma migrations
#   5. Generate Prisma Client
#   6. Optionally deploy to Vercel
# =============================================================================

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Fitness System Mobile — Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Step 1: Install dependencies ──────────────────────────────────────────────
echo "📦 Installing dependencies..."
npm install

# ── Step 2: Create .env.local ─────────────────────────────────────────────────
if [ -f .env.local ]; then
  echo "⚠️  .env.local already exists. Skipping creation."
  echo "   Delete it and re-run if you want to start fresh."
else
  echo ""
  echo "🔧 Configuring environment variables..."
  echo "   You'll need credentials from: Neon, Google Cloud, Stripe, Resend"
  echo ""

  # DATABASE_URL
  echo "── Neon (PostgreSQL) ──"
  read -p "DATABASE_URL (postgresql://...): " DATABASE_URL

  # Google OAuth
  echo ""
  echo "── Google Cloud OAuth ──"
  read -p "AUTH_GOOGLE_ID (xxx.apps.googleusercontent.com): " AUTH_GOOGLE_ID
  read -p "AUTH_GOOGLE_SECRET (GOCSPX-...): " AUTH_GOOGLE_SECRET

  # Stripe
  echo ""
  echo "── Stripe ──"
  read -p "STRIPE_SECRET_KEY (sk_test_... or sk_live_...): " STRIPE_SECRET_KEY
  read -p "STRIPE_WEBHOOK_SECRET (whsec_...): " STRIPE_WEBHOOK_SECRET
  read -p "STRIPE_PRICE_ID_PRO (price_...): " STRIPE_PRICE_ID_PRO

  # Resend
  echo ""
  echo "── Resend ──"
  read -p "RESEND_API_KEY (re_...): " RESEND_API_KEY

  # App URL
  echo ""
  echo "── App URL ──"
  read -p "APP_URL (e.g. https://fitness-system-app.vercel.app): " APP_URL
  APP_URL=${APP_URL:-https://fitness-system-app.vercel.app}

  # Generate AUTH_SECRET
  AUTH_SECRET=$(openssl rand -base64 32)

  # Write .env.local
  cat > .env.local << EOF
# Database (Neon)
DATABASE_URL="${DATABASE_URL}"

# Auth.js v5
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="${APP_URL}"
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID="${AUTH_GOOGLE_ID}"
AUTH_GOOGLE_SECRET="${AUTH_GOOGLE_SECRET}"
AUTH_RESEND_KEY="${RESEND_API_KEY}"

# Stripe
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"
STRIPE_PRICE_ID_PRO="${STRIPE_PRICE_ID_PRO}"

# App
NEXT_PUBLIC_APP_URL="${APP_URL}"
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO="${STRIPE_PRICE_ID_PRO}"

# Resend (emails transacionais)
RESEND_API_KEY="${RESEND_API_KEY}"
EOF

  echo ""
  echo "✅ .env.local created"
fi

# ── Step 3: Prisma ────────────────────────────────────────────────────────────
echo ""
echo "🗄️  Running Prisma migrations..."
npx prisma migrate deploy

echo "🔧 Generating Prisma Client..."
npx prisma generate

# ── Step 4: Build test ────────────────────────────────────────────────────────
echo ""
echo "🔨 Testing build..."
npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Run locally:  npm run dev"
echo "  Deploy:       vercel --prod"
echo ""

# ── Step 5: Optional deploy ───────────────────────────────────────────────────
read -p "🚀 Deploy to Vercel now? (y/N): " DEPLOY
if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
  echo ""
  echo "Deploying to Vercel..."

  # Check if vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
  fi

  # Push env vars to Vercel
  echo "Pushing environment variables to Vercel..."
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    # Remove quotes from value
    value="${value%\"}"
    value="${value#\"}"
    echo "$value" | vercel env add "$key" production --force 2>/dev/null || true
  done < .env.local

  vercel --prod
  echo ""
  echo "✅ Deployed! Check your Vercel dashboard."
fi

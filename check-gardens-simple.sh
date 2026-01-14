#!/bin/bash
SUPABASE_URL="https://qhmujoivfxftlrcrluaj.supabase.co"
USER_ID="73317116-7df0-4c34-a1f7-d2828a92ac39"

echo "🔍 Checking gardens for user: $USER_ID"
echo ""

# Check gardens
curl -s "$SUPABASE_URL/rest/v1/gardens?user_id=eq.$USER_ID&select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" | jq '.'

echo ""
echo "🔍 Checking user profile..."
curl -s "$SUPABASE_URL/rest/v1/user_profiles?id=eq.$USER_ID&select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" | jq '.'

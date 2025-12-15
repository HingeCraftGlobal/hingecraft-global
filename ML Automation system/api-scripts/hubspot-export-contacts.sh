#!/bin/bash
# Export contacts from HubSpot
EXPORT_ID=$(curl --request POST \
  --url 'https://api.hubapi.com/crm/v3/exports' \
  --header "Authorization: Bearer na2-e523-6348-4407-a23a-d0c00f2ed0ca" \
  --header 'Content-Type: application/json' \
  --data @api-payloads/hubspot-export-payload.json | jq -r '.id')

echo "Export ID: $EXPORT_ID"
echo "Poll status with: curl --request GET --url "https://api.hubapi.com/crm/v3/exports/$EXPORT_ID" --header "Authorization: Bearer na2-e523-6348-4407-a23a-d0c00f2ed0ca""
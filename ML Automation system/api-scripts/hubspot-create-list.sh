#!/bin/bash
# Create "Ready to Send" List in HubSpot
curl --request POST \
  --url 'https://api.hubapi.com/crm/v3/lists' \
  --header "Authorization: Bearer na2-e523-6348-4407-a23a-d0c00f2ed0ca" \
  --header 'Content-Type: application/json' \
  --data @api-payloads/hubspot-ready-to-send-list.json
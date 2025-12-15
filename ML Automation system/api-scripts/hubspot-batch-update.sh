#!/bin/bash
# Batch update contacts in HubSpot
curl --request POST \
  --url 'https://api.hubapi.com/crm/v3/objects/contacts/batch/update' \
  --header "Authorization: Bearer na2-e523-6348-4407-a23a-d0c00f2ed0ca" \
  --header 'Content-Type: application/json' \
  --data @api-payloads/hubspot-batch-update-template.json
#!/bin/bash
# Execute Google Apps Script function
SCRIPT_ID="1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl --request POST \
  --url "https://script.googleapis.com/v1/scripts/$SCRIPT_ID:run" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "Content-Type: application/json" \
  --data @api-payloads/gas-execution-payload.json
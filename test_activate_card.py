import requests
import json

# Use the token from the previous auth
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY4MzAwMDEsInN1YiI6InRlc3QtdXNlci0xIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIn0.fb9cUKH_r-lyjNye6sRXBTvMDwU7KIGmpf_tLrv0vBE"

# Main Focus card ID
card_id = "e4c805ef-1dcc-4f3e-a548-825477bf3e90"

print(f"Activating card {card_id}...")
response = requests.patch(
    f"http://localhost:8001/api/v1/cards/{card_id}",
    headers={"Authorization": f"Bearer {token}"},
    json={"status": "active"}
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"Success! Card updated: {json.dumps(response.json(), indent=2)}")
else:
    print(f"Error: {response.text}")

# Check cards again
print("\n\nGetting all cards to verify...")
response = requests.get(
    "http://localhost:8001/api/v1/cards/",
    headers={"Authorization": f"Bearer {token}"}
)

if response.status_code == 200:
    cards = response.json()
    for card in cards:
        print(f"- {card['title']}: {card['status']}")
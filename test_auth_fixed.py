import requests
import json

# Test authentication flow
print("1. Requesting OTP...")
response = requests.post(
    "http://localhost:8000/api/v1/auth-otp/request-otp",
    json={"email": "test@example.com", "full_name": "Test User"}
)
otp_data = response.json()
print(f"   Response: {otp_data}")
otp_code = otp_data.get("debug_otp")

if not otp_code:
    print("   ERROR: No OTP code received")
    exit(1)

print(f"\n2. Verifying OTP: {otp_code}")
response = requests.post(
    "http://localhost:8000/api/v1/auth-otp/verify-otp",
    json={"email": "test@example.com", "otp": otp_code}
)
auth_data = response.json()
print(f"   Response: {json.dumps(auth_data, indent=2)}")
token = auth_data.get("access_token")

if not token:
    print("   ERROR: No access token received")
    exit(1)

print(f"\n3. Testing /cards/ endpoint with token...")
print(f"   Token (first 50 chars): {token[:50]}...")
response = requests.get(
    "http://localhost:8000/api/v1/cards/",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print(f"   Success! Cards: {json.dumps(response.json(), indent=2)}")
else:
    print(f"   ERROR: {response.text}")

print(f"\n4. Testing /auth-otp/me endpoint with token...")
response = requests.get(
    "http://localhost:8000/api/v1/auth-otp/me",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print(f"   Success! User: {json.dumps(response.json(), indent=2)}")
else:
    print(f"   ERROR: {response.text}")
from jose import jwt
from app.core.config import settings

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY4MDQ4ODgsInN1YiI6InRlc3QtdXNlci0xIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIn0.6N6Ffchlqg8OQxAzfyTXxiS7zo_VMtI0ueYs7vUJt_M"

print(f"SECRET_KEY: {settings.SECRET_KEY}")
print(f"ALGORITHM: {settings.ALGORITHM}")

try:
    # Decode without audience verification first
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_aud": False})
    print(f"SUCCESS! Payload: {payload}")
except Exception as e:
    print(f"ERROR: {e}")
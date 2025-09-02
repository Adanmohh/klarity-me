from jose import jwt

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY4MDcyMTYsInN1YiI6InRlc3QtdXNlci0xIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIn0.ECyXjJRPXw0GS6lVYOTxnMqOGgzozDI-C4pdXzuCmAY"
secret_key = "F788C73VV6E45cm29KDmtDu_Q7yXROsKWGjoqEbIXXQ"

try:
    payload = jwt.decode(token, secret_key, algorithms=["HS256"], options={"verify_aud": False})
    print(f"SUCCESS! Payload: {payload}")
except Exception as e:
    print(f"ERROR: {e}")
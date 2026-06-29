import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Vercel: set FIREBASE_CREDENTIALS to the full service account JSON string
# Local: set GOOGLE_APPLICATION_CREDENTIALS to the path of serviceAccount.json
cred_json = os.getenv("FIREBASE_CREDENTIALS")
if cred_json:
    cred = credentials.Certificate(json.loads(cred_json))
else:
    cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

firebase_admin.initialize_app(cred)
db = firestore.client()

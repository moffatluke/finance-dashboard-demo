from flask import Blueprint, request, jsonify
from db import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

transactions_bp = Blueprint("transactions", __name__)
COLLECTION = "transactions"
REQUIRED = ["amount", "type", "category", "description", "date", "paymentMethod"]

DEMO_MSG = {"error": "Demo mode — writes are disabled."}


@transactions_bp.get("/api/transactions")
def get_transactions():
    try:
        docs = db.collection(COLLECTION).stream()
        return jsonify([{"id": d.id, **d.to_dict()} for d in docs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@transactions_bp.post("/api/transactions")
def create_transaction():
    return jsonify(DEMO_MSG), 403


@transactions_bp.put("/api/transactions/<doc_id>")
def update_transaction(doc_id):
    return jsonify(DEMO_MSG), 403


@transactions_bp.delete("/api/transactions/<doc_id>")
def delete_transaction(doc_id):
    return jsonify(DEMO_MSG), 403

from flask import Blueprint, request, jsonify
from db import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

contacts_bp = Blueprint("contacts", __name__)
COLLECTION = "contacts"
REQUIRED = ["name"]

DEMO_MSG = {"error": "Demo mode — writes are disabled."}


@contacts_bp.get("/api/contacts")
def get_contacts():
    try:
        status = request.args.get("status")
        col = db.collection(COLLECTION)
        docs = col.where("status", "==", status).stream() if status else col.stream()
        return jsonify([{"id": d.id, **d.to_dict()} for d in docs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@contacts_bp.post("/api/contacts")
def create_contact():
    return jsonify(DEMO_MSG), 403


@contacts_bp.put("/api/contacts/<doc_id>")
def update_contact(doc_id):
    return jsonify(DEMO_MSG), 403


@contacts_bp.delete("/api/contacts/<doc_id>")
def delete_contact(doc_id):
    return jsonify(DEMO_MSG), 403

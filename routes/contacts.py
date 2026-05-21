from flask import Blueprint, request, jsonify
from db import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

contacts_bp = Blueprint("contacts", __name__)
COLLECTION = "contacts"
REQUIRED = ["name"]


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
    try:
        data = request.get_json()
        for field in REQUIRED:
            if not data.get(field):
                return jsonify({"error": f"'{field}' is required"}), 400
        data["createdAt"] = SERVER_TIMESTAMP
        ref = db.collection(COLLECTION).document()
        ref.set(data)
        return jsonify({"id": ref.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@contacts_bp.put("/api/contacts/<doc_id>")
def update_contact(doc_id):
    try:
        data = request.get_json()
        data.pop("createdAt", None)
        ref = db.collection(COLLECTION).document(doc_id)
        if not ref.get().exists:
            return jsonify({"error": "Contact not found"}), 404
        ref.update(data)
        return jsonify({"id": doc_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@contacts_bp.delete("/api/contacts/<doc_id>")
def delete_contact(doc_id):
    try:
        ref = db.collection(COLLECTION).document(doc_id)
        if not ref.get().exists:
            return jsonify({"error": "Contact not found"}), 404
        ref.delete()
        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
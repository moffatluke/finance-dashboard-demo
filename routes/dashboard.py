from flask import Blueprint, jsonify
from db import db  # reuse the Firestore connection

dashboard_bp = Blueprint("dashboard", __name__)


# GET /api/dashboard — returns a summary of contacts and transactions
@dashboard_bp.get("/api/dashboard")
def get_dashboard():
    try:
        # fetch all contacts and transactions from Firestore
        contacts = [{"id": d.id, **d.to_dict()} for d in db.collection("contacts").stream()]
        transactions = [{"id": d.id, **d.to_dict()} for d in db.collection("transactions").stream()]

        # count contacts by status
        by_status = {"Lead": 0, "Contacted": 0, "Customer": 0}
        for c in contacts:
            status = c.get("status", "")
            if status in by_status:
                by_status[status] += 1

        # sum up income and expenses separately
        total_income = sum(t["amount"] for t in transactions if t.get("type") == "income")
        total_expenses = sum(t["amount"] for t in transactions if t.get("type") == "expense")

        # sort contacts by follow-up date, return the 5 most recent
        recent_contacts = sorted(
            [{k: v for k, v in c.items() if k != "createdAt"} for c in contacts],
            key=lambda c: c.get("followUpDate", ""),
            reverse=True
        )[:5]

        # sort transactions by date, return the 5 most recent
        recent_transactions = sorted(
            [{k: v for k, v in t.items() if k != "createdAt"} for t in transactions],
            key=lambda t: t.get("date", ""),
            reverse=True
        )[:5]

        return jsonify({
            "totalContacts": len(contacts),
            "byStatus": by_status,
            "totalIncome": total_income,
            "totalExpenses": total_expenses,
            "recentContacts": recent_contacts,
            "recentTransactions": recent_transactions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
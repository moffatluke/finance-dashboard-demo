import pytest
from unittest.mock import patch, MagicMock
from app import create_app


@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as c:
        yield c


def make_mock_doc(doc_id, data):
    doc = MagicMock()
    doc.id = doc_id
    doc.to_dict.return_value = data
    return doc


def test_dashboard_returns_summary(client):
    mock_contacts = [
        make_mock_doc("c1", {"name": "Alice", "status": "Lead", "company": "Acme", "followUpDate": "2026-06-01", "createdAt": None}),
        make_mock_doc("c2", {"name": "Bob", "status": "Customer", "company": "Beta", "followUpDate": "2026-05-15", "createdAt": None}),
    ]
    mock_transactions = [
        make_mock_doc("t1", {"amount": 1000, "type": "income", "description": "Sale", "date": "2026-05-09", "createdAt": None}),
        make_mock_doc("t2", {"amount": 200, "type": "expense", "description": "Software", "date": "2026-05-08", "createdAt": None}),
    ]
    with patch("routes.dashboard.db") as mock_db:
        def collection_side_effect(name):
            mock_col = MagicMock()
            if name == "contacts":
                mock_col.stream.return_value = mock_contacts
            else:
                mock_col.stream.return_value = mock_transactions
            return mock_col
        mock_db.collection.side_effect = collection_side_effect

        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.get_json()
        assert data["totalContacts"] == 2
        assert data["byStatus"]["Lead"] == 1
        assert data["byStatus"]["Customer"] == 1
        assert data["totalIncome"] == 1000
        assert data["totalExpenses"] == 200
        assert len(data["recentContacts"]) == 2
        assert len(data["recentTransactions"]) == 2
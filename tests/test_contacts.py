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


def test_get_contacts_returns_list(client):
    mock_doc = make_mock_doc("abc123", {"name": "Jane Doe", "status": "Lead"})
    with patch("routes.contacts.db") as mock_db:
        mock_db.collection.return_value.stream.return_value = [mock_doc]
        response = client.get("/api/contacts")
        assert response.status_code == 200
        data = response.get_json()
        assert data[0]["name"] == "Jane Doe"
        assert data[0]["id"] == "abc123"


def test_get_contacts_filter_by_status(client):
    mock_doc = make_mock_doc("abc123", {"name": "Jane Doe", "status": "Lead"})
    with patch("routes.contacts.db") as mock_db:
        mock_db.collection.return_value.where.return_value.stream.return_value = [mock_doc]
        response = client.get("/api/contacts?status=Lead")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1


def test_create_contact_missing_name_returns_400(client):
    with patch("routes.contacts.db"):
        response = client.post("/api/contacts", json={"email": "test@test.com"})
        assert response.status_code == 400


def test_create_contact_success(client):
    with patch("routes.contacts.db") as mock_db:
        mock_ref = MagicMock()
        mock_ref.id = "new123"
        mock_db.collection.return_value.document.return_value = mock_ref
        response = client.post("/api/contacts", json={
            "name": "John Smith",
            "email": "john@example.com",
            "phone": "555-1234",
            "company": "Acme",
            "status": "Lead",
            "notes": "",
            "followUpDate": "2026-06-01"
        })
        assert response.status_code == 201
        assert response.get_json()["id"] == "new123"


def test_delete_contact_success(client):
    with patch("routes.contacts.db") as mock_db:
        mock_db.collection.return_value.document.return_value.get.return_value.exists = True
        response = client.delete("/api/contacts/abc123")
        assert response.status_code == 200


def test_delete_contact_not_found(client):
    with patch("routes.contacts.db") as mock_db:
        mock_db.collection.return_value.document.return_value.get.return_value.exists = False
        response = client.delete("/api/contacts/missing")
        assert response.status_code == 404
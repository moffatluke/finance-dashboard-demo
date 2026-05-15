import pytest
from unittest.mock import patch, MagicMock

@pytest.fixture(autouse=True, scope="session")
def mock_firebase():
    with patch("firebase_admin.initialize_app"), \
         patch("firebase_admin.credentials.Certificate", return_value=MagicMock()), \
        patch("firebase_admin.firestore.client", return_value=MagicMock()):
        yield
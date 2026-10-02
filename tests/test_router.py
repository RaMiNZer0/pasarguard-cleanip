"""
Integration tests for Clean IP FastAPI Router
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pathlib import Path
import tempfile
import os

from backend.cleanip_router import router, DATA_DIR


@pytest.fixture
def client(monkeypatch):
    with tempfile.TemporaryDirectory(dir=".") as temp_dir:
        tmp_path = Path(temp_dir)
        monkeypatch.setattr("backend.cleanip_router.DATA_DIR", tmp_path)
        monkeypatch.setattr("backend.cleanip_router.SETTINGS_FILE", tmp_path / "settings.json")
        monkeypatch.setattr("backend.cleanip_router.HISTORY_FILE", tmp_path / "history.json")

        app = FastAPI()
        app.include_router(router)
        yield TestClient(app)


def test_get_status_default(client):
    """Test default status response"""
    res = client.get("/api/cleanip/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    assert "settings" in data
    assert data["settings"]["auto_pilot"] is True


def test_get_hosts_list(client):
    """Test hosts listing endpoint"""
    res = client.get("/api/cleanip/hosts")
    assert res.status_code == 200
    hosts = res.json()
    assert isinstance(hosts, list)
    assert len(hosts) > 0


def test_update_settings(client):
    """Test saving settings"""
    payload = {
        "target_host_ids": [1, 2],
        "enabled_isps": ["mci", "mtn"],
        "limit_per_isp": 3,
        "auto_pilot": True,
        "auto_interval_hours": 6,
        "custom_ips": ["104.16.1.1"]
    }
    res = client.post("/api/cleanip/settings", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["settings"]["target_host_ids"] == [1, 2]

    # Verify status reflects the saved settings
    status_res = client.get("/api/cleanip/status")
    assert status_res.json()["settings"]["target_host_ids"] == [1, 2]


def test_scan_and_apply_without_target_host(client):
    """Test scan-and-apply fails when no host is selected"""
    res = client.post("/api/cleanip/scan-and-apply")
    assert res.status_code == 400
    assert "No target hosts selected" in res.json()["detail"]


def test_scan_and_apply_success(client, monkeypatch):
    """Test scan-and-apply succeeds when target hosts are set"""
    # 1. Set target hosts
    client.post("/api/cleanip/settings", json={
        "target_host_ids": [1, 2],
        "enabled_isps": ["mci"],
        "limit_per_isp": 2,
        "auto_pilot": True,
        "auto_interval_hours": 3,
        "custom_ips": []
    })

    # Mock engine scanner
    async def mock_scan(*args, **kwargs):
        return {"mci": [{"ip": "104.16.24.11", "latency_ms": 55.0}]}

    monkeypatch.setattr("backend.cleanip_router.scan_and_rank_ips", mock_scan)

    # 2. Trigger scan
    res = client.post("/api/cleanip/scan-and-apply")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "104.16.24.11" in data["applied_ips"]
    assert len(data["updated_hosts"]) == 2

    # 3. Check history was logged
    status_res = client.get("/api/cleanip/status")
    assert status_res.json()["latest_update"] is not None


def test_get_candidates(client):
    """Test candidate IP listing for browser probe"""
    res = client.get("/api/cleanip/candidates")
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    assert isinstance(data["candidates"], list)
    assert len(data["candidates"]) > 0
    assert "ip" in data["candidates"][0]


def test_diagnose_endpoint(client, monkeypatch):
    """Test /diagnose endpoint"""
    async def mock_diag(*args, **kwargs):
        return {
            "domain": kwargs.get("domain", "test.com"),
            "port": kwargs.get("port", 443),
            "overall_healthy": True,
            "summary": "OK"
        }

    monkeypatch.setattr("backend.cleanip_engine.diagnose_infrastructure", mock_diag)
    res = client.post("/api/cleanip/diagnose", json={"host_id": 1})
    assert res.status_code == 200
    data = res.json()
    assert data["overall_healthy"] is True
    assert data["port"] == 443

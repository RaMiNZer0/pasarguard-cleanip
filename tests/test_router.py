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


def test_ping_candidates_endpoint(client, monkeypatch):
    """Test /ping-candidates endpoint"""
    async def mock_latency(ip, *args, **kwargs):
        return 95.0

    monkeypatch.setattr("backend.cleanip_router.check_ip_latency", mock_latency)
    res = client.post("/api/cleanip/ping-candidates", json={"ips": ["104.16.24.11", "104.16.25.11"]})
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) == 2
    assert data["results"][0]["latency_ms"] == 95.0
    assert data["results"][0]["reachable"] is True


def test_apply_selected_endpoint(client):
    """Test /apply-selected endpoint"""
    res = client.post("/api/cleanip/apply-selected", json={
        "host_ids": [1, 2],
        "selected_ips": ["104.16.24.11", "104.17.150.10"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["applied_ips"]) == 2
    assert len(data["updated_hosts"]) == 2


def test_discover_cf_ips_endpoint(client):
    """Test /discover-cf-ips endpoint"""
    res = client.post("/api/cleanip/discover-cf-ips?count=10&auto_ping=false")
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    assert len(data["candidates"]) == 10
    assert "ip" in data["candidates"][0]


def test_discover_cf_ips_with_auto_ping(client, monkeypatch):
    """Test /discover-cf-ips endpoint with auto_ping enabled"""
    async def mock_discover(count=10, timeout=1.8):
        return [
            {"ip": f"104.16.1.{i}", "latency_ms": 80.0 + i, "reachable": True, "isp": "wifi"}
            for i in range(count)
        ]

    monkeypatch.setattr("backend.cleanip_engine.discover_and_test_cf_ips", mock_discover)
    res = client.post("/api/cleanip/discover-cf-ips?count=5&auto_ping=true")
    assert res.status_code == 200
    data = res.json()
    assert len(data["candidates"]) == 5
    assert data["candidates"][0]["latency_ms"] == 80.0
    assert data["candidates"][0]["reachable"] is True


def test_sni_protection_on_native_modify(client, monkeypatch):
    """Test that SNI is preserved from domain address if sni was empty"""
    class MockHost:
        id = 1
        remark = "CDN Test"
        address = ["cdn.domain.com"]
        sni = ""
        port = 443
        inbound_tag = "cf-in"

    modified_captured = []

    class MockHostOp:
        async def get_validated_host(self, db, host_id):
            return MockHost()

        async def modify_host(self, db, host_id, modified_host, admin):
            modified_captured.append(modified_host)

    class MockBaseHost:
        @classmethod
        def model_validate(cls, obj):
            return cls()

        def model_dump(self):
            return {
                "remark": "CDN Test",
                "address": ["cdn.domain.com"],
                "sni": "",
                "port": 443,
                "inbound_tag": "cf-in"
            }

    class MockCreateHost(dict):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self.__dict__ = self

    monkeypatch.setattr("backend.cleanip_router.PASARGUARD_NATIVE", True)
    monkeypatch.setattr("backend.cleanip_router.host_operator", MockHostOp())
    monkeypatch.setattr("backend.cleanip_router.BaseHost", MockBaseHost)
    monkeypatch.setattr("backend.cleanip_router.CreateHost", MockCreateHost)

    res = client.post("/api/cleanip/apply-selected", json={
        "host_ids": [1],
        "selected_ips": ["104.16.24.11"]
    })
    assert res.status_code == 200
    assert len(modified_captured) == 1
    # Check that sni was populated from address domain
    assert modified_captured[0].sni == "cdn.domain.com"
    assert modified_captured[0].address == {"104.16.24.11"}


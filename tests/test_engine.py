"""
Unit tests for Clean IP Engine
"""
import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from backend.cleanip_engine import (
    check_ip_latency,
    fetch_community_ips,
    scan_and_rank_ips,
    get_candidate_probe_list,
    FALLBACK_IPS,
)


@pytest.mark.asyncio
async def test_check_ip_latency_success():
    """Test latency measurement when connection succeeds"""
    mock_reader = AsyncMock()
    mock_writer = AsyncMock()
    mock_writer.close = MagicMock()
    mock_writer.wait_closed = AsyncMock()

    with patch("asyncio.open_connection", new_callable=AsyncMock) as mock_open:
        mock_open.return_value = (mock_reader, mock_writer)
        latency = await check_ip_latency("104.16.24.11", timeout=1.0)
        assert latency >= 0.0
        mock_open.assert_called_once()


@pytest.mark.asyncio
async def test_check_ip_latency_failure():
    """Test latency measurement when connection fails or times out"""
    with patch("asyncio.open_connection", side_effect=asyncio.TimeoutError):
        latency = await check_ip_latency("192.0.2.1", timeout=0.1)
        assert latency == -1.0


def test_fetch_community_ips_fallback():
    """Test fallback when remote URL is unavailable"""
    with patch("urllib.request.urlopen", side_effect=Exception("Network error")):
        ips = fetch_community_ips()
        assert "mci" in ips
        assert "mtn" in ips
        assert "wifi" in ips
        assert len(ips["mci"]) > 0
        assert "ip" in ips["mci"][0]


@pytest.mark.asyncio
async def test_scan_and_rank_ips():
    """Test ranking and filtering per ISP"""
    async def mock_latency(ip, **kwargs):
        if "104.16.24.11" in ip:
            return 45.0
        elif "104.16.25.11" in ip:
            return 85.0
        return -1.0

    with patch("backend.cleanip_engine.check_ip_latency", side_effect=mock_latency):
        results = await scan_and_rank_ips(isps=["mci"], limit_per_isp=2)
        assert "mci" in results
        assert len(results["mci"]) > 0
        assert results["mci"][0]["latency_ms"] <= results["mci"][-1]["latency_ms"]


@pytest.mark.asyncio
async def test_custom_ips_priority():
    """Test that custom IPs are prioritized when healthy"""
    custom_ip = "198.51.100.42"

    async def mock_latency(ip, **kwargs):
        if ip == custom_ip:
            return 30.0
        return 75.0

    with patch("backend.cleanip_engine.check_ip_latency", side_effect=mock_latency):
        results = await scan_and_rank_ips(isps=["mci"], limit_per_isp=2, custom_ips=[custom_ip])
        assert results["mci"][0]["ip"] == custom_ip
        assert results["mci"][0]["quality"] == "custom"


def test_get_candidate_probe_list():
    """Test candidate probe list generation"""
    candidates = get_candidate_probe_list(limit=5)
    assert len(candidates) > 0
    assert "ip" in candidates[0]
    assert "isp" in candidates[0]

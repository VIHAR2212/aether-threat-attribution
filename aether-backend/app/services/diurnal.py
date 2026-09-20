"""Diurnal activity and circadian timezone estimation service for Project AETHER.

Analyzes timestamped threat actor activity logs (forum posts, commit logs,
transaction broadcasts) in UTC, constructs a 24-hour activity distribution,
identifies the minimum-activity sleep trough window, and infers probable
operational UTC timezones.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


# Known operational timezone clusters for threat intelligence mapping
TIMEZONE_REGIONS = {
    -8: ["US Pacific (PST/PDT)", "Vancouver"],
    -5: ["US Eastern (EST/EDT)", "Bogota", "Lima"],
    -4: ["Atlantic Standard", "Caracas"],
    0: ["UTC / GMT", "London", "Lisbon", "Reykjavik"],
    1: ["Central European (CET)", "Berlin", "Paris", "Rome", "Warsaw"],
    2: ["Eastern European (EET)", "Bucharest", "Athens", "Helsinki", "Cairo"],
    3: ["Moscow Time (MSK)", "St. Petersburg", "Minsk", "Istanbul", "Riyadh"],
    4: ["Samara Time", "Dubai", "Baku", "Tbilisi"],
    5: ["Yekaterinburg Time", "Tashkent", "Karachi"],
    5.5: ["India Standard Time (IST)", "Sri Lanka"],
    6: ["Omsk Time", "Dhaka", "Almaty"],
    7: ["Krasnoyarsk Time", "Bangkok", "Jakarta"],
    8: ["Irkutsk Time", "Beijing", "Singapore", "Perth"],
    9: ["Yakutsk Time", "Tokyo", "Seoul"],
}


def parse_timestamp_to_utc_hour(ts: str | datetime | int | float) -> Optional[int]:
    """Parse various timestamp formats into a UTC hour (0-23)."""
    try:
        if isinstance(ts, (int, float)):
            dt = datetime.fromtimestamp(ts)
            return dt.hour

        if isinstance(ts, datetime):
            return ts.hour

        # ISO string parsing
        clean_ts = ts.strip().replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        return dt.hour
    except Exception:
        return None


def calculate_24h_histogram(timestamps: List[str | datetime | int | float]) -> List[int]:
    """Bucket timestamps into 24 one-hour UTC intervals [0..23]."""
    histogram = [0] * 24
    for ts in timestamps:
        hour = parse_timestamp_to_utc_hour(ts)
        if hour is not None and 0 <= hour <= 23:
            histogram[hour] += 1
    return histogram


def find_sleep_trough(histogram: List[int], window_size: int = 6) -> Tuple[int, int, int]:
    """Find the continuous window of window_size hours with minimum activity.

    Returns:
        (trough_start_hour, trough_end_hour, min_activity_count)
    """
    n = len(histogram)
    if sum(histogram) == 0:
        return (0, window_size, 0)

    # Compute rolling circular sum of window_size
    min_sum = float("inf")
    best_start = 0

    for start in range(n):
        curr_sum = sum(histogram[(start + i) % n] for i in range(window_size))
        if curr_sum < min_sum:
            min_sum = curr_sum
            best_start = start

    end_hour = (best_start + window_size) % n
    return (best_start, end_hour, int(min_sum))


def estimate_utc_offset(trough_start: int, window_size: int = 6) -> float:
    """Estimate operational UTC offset given a UTC sleep trough.

    Assumption: Standard human biological sleep trough centers around
    03:30 local time (e.g. sleep from 00:30 to 06:30 local).
    Offset = (Assumed Local Sleep Center - UTC Sleep Center)
    """
    utc_sleep_center = (trough_start + (window_size / 2.0)) % 24.0
    assumed_local_center = 3.5

    # Raw difference in hours
    diff = assumed_local_center - utc_sleep_center

    # Normalize to range [-12, +14]
    while diff > 14.0:
        diff -= 24.0
    while diff < -12.0:
        diff += 24.0

    # Nearest 0.5 hour rounding
    return round(diff * 2) / 2.0


def format_utc_offset(offset: float) -> str:
    """Format float offset into string like '+03:00' or '-05:00'."""
    sign = "+" if offset >= 0 else "-"
    abs_off = abs(offset)
    hours = int(abs_off)
    minutes = int((abs_off - hours) * 60)
    return f"UTC{sign}{hours:02d}:{minutes:02d}"


def analyze_diurnal_activity(
    timestamps: List[str | datetime | int | float],
    window_size: int = 6,
) -> Dict[str, Any]:
    """Full diurnal activity analysis."""
    histogram = calculate_24h_histogram(timestamps)
    total_events = sum(histogram)

    if total_events == 0:
        return {
            "total_events": 0,
            "histogram": histogram,
            "sleep_trough": None,
            "estimated_offset": None,
            "candidate_regions": [],
            "contrast_ratio": 0.0,
        }

    trough_start, trough_end, trough_events = find_sleep_trough(
        histogram, window_size=window_size
    )
    offset_num = estimate_utc_offset(trough_start, window_size=window_size)
    offset_str = format_utc_offset(offset_num)

    # Calculate peak vs trough contrast ratio
    max_hour_events = max(histogram)
    peak_window_start = (trough_start + 12) % 24
    peak_window_events = sum(
        histogram[(peak_window_start + i) % 24] for i in range(window_size)
    )

    contrast_ratio = (
        round(peak_window_events / max(1, trough_events), 2)
        if trough_events > 0
        else float(peak_window_events)
    )

    # Find candidate regions closest to estimated offset
    candidate_key = min(
        TIMEZONE_REGIONS.keys(), key=lambda k: abs(k - offset_num)
    )
    candidate_regions = TIMEZONE_REGIONS.get(candidate_key, ["Unknown region"])

    return {
        "total_events": total_events,
        "histogram": histogram,
        "sleep_trough": {
            "start_utc": trough_start,
            "end_utc": trough_end,
            "duration_hours": window_size,
            "events_in_trough": trough_events,
        },
        "estimated_timezone": {
            "offset_hours": offset_num,
            "formatted_offset": offset_str,
            "primary_candidate_key": candidate_key,
            "candidate_regions": candidate_regions,
        },
        "metrics": {
            "peak_single_hour": max_hour_events,
            "trough_to_peak_contrast": contrast_ratio,
        },
    }

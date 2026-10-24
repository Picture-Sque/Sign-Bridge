"""Placeholder test for the empty scaffold (P0-03).

It also checks that the interpreter matches the version pinned in
.python-version.
"""

import sys
from pathlib import Path


def test_python_matches_pinned_version():
    pinned = (Path(__file__).parent.parent / ".python-version").read_text().strip()
    assert f"{sys.version_info.major}.{sys.version_info.minor}" == pinned

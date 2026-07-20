"""
SSE utilities for streaming text responses.
"""

from typing import Iterable


def format_sse_event(data: str) -> str:
    """Encode a multiline payload into a valid Server-Sent Events message.

    Each original text line is prefixed with `data:`. Blank lines are preserved
    as empty data lines, and a blank line terminates the SSE event.
    """
    if data is None:
        data = ''

    lines = data.split('\n')
    encoded_lines = [f"data: {line}\n" if line != '' else "data:\n" for line in lines]
    return ''.join(encoded_lines) + '\n'

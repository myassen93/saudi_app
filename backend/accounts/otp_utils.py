import base64
import io

import qrcode


def qr_data_uri(device):
    """Render a TOTP device's provisioning URI as a base64 PNG data URI."""
    image = qrcode.make(device.config_url)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"

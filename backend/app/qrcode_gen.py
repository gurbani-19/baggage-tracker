"""
QR Code generation utilities for baggage tracking
"""
import qrcode
from io import BytesIO
from fastapi.responses import Response

def generate_qr_code(bag_id: str, size: int = 10) -> bytes:
    """
    Generate QR code image for a bag ID
    
    Args:
        bag_id: The bag UUID to encode
        size: QR code size (box_size parameter)
    
    Returns:
        PNG image bytes
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=size,
        border=4,
    )
    qr.add_data(bag_id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def get_qr_code_response(bag_id: str) -> Response:
    """
    Get FastAPI Response with QR code image
    
    Args:
        bag_id: The bag UUID to encode
    
    Returns:
        FastAPI Response with PNG image
    """
    qr_bytes = generate_qr_code(bag_id)
    return Response(content=qr_bytes, media_type="image/png")
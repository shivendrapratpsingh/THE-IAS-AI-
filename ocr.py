"""
Offline OCR helper for the Answer Writing tracker.

Uses pytesseract + the Tesseract OCR engine, both of which run fully
locally - no internet connection or API key needed. Tesseract itself is a
separate program that must be installed once (see README.md).
"""
from PIL import Image, UnidentifiedImageError

try:
    import pytesseract
    from pytesseract import TesseractNotFoundError
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False
    TesseractNotFoundError = Exception


def extract_text(file_stream):
    """Run OCR on an uploaded image file.

    Returns (text, error). On success `error` is None. On failure `text`
    is None and `error` is a user-facing message.
    """
    if not PYTESSERACT_AVAILABLE:
        return None, (
            "OCR support isn't installed. Run "
            "'pip install -r requirements.txt' to add it."
        )

    try:
        image = Image.open(file_stream)
    except UnidentifiedImageError:
        return None, "That file doesn't look like an image. Please upload a JPG or PNG photo of your answer."
    except Exception as exc:
        return None, f"Couldn't open the image: {exc}"

    try:
        text = pytesseract.image_to_string(image)
    except TesseractNotFoundError:
        return None, (
            "The Tesseract OCR engine isn't installed on this computer. "
            "Install it from https://github.com/UB-Mannheim/tesseract/wiki "
            "(Windows) and make sure 'tesseract' is on your PATH, then try again. "
            "See README.md for details."
        )
    except Exception as exc:
        return None, f"OCR failed: {exc}"

    text = text.strip()
    if not text:
        return None, (
            "No text could be read from that image. Try a clearer, "
            "well-lit photo with the page filling the frame."
        )

    return text, None

"""
Run ONCE with internet: python tools/gen_legal_images.py
Images are then bundled into static/images/legal/; the app runs fully offline.
"""
import json, os, sys, hashlib, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE   = os.path.join(ROOT, "data", "legal_questions.json")
IMAGES_DIR  = os.path.join(ROOT, "static", "images", "legal")
BASE_URL    = "https://image.pollinations.ai/prompt/{prompt}?width=1280&height=720&nologo=true&model=flux&seed={seed}"

def stable_seed(topic: str) -> int:
    return int(hashlib.sha256(topic.encode()).hexdigest(), 16) % (2**31)

def download(prompt: str, topic: str, dest: str):
    if os.path.exists(dest):
        print(f"  [skip] {os.path.basename(dest)} already exists")
        return
    seed = stable_seed(topic)
    url  = BASE_URL.format(prompt=urllib.parse.quote(prompt), seed=seed)
    print(f"  [fetch] {topic} …", end=" ", flush=True)
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            data = r.read()
        # Optionally re-save as JPEG quality 80 if Pillow available
        try:
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(data)).convert("RGB")
            img.save(dest, "JPEG", quality=80, optimize=True)
        except ImportError:
            with open(dest, "wb") as f:
                f.write(data)
        print(f"saved ({len(data)//1024} KB)")
    except Exception as e:
        print(f"FAILED — {e}")

def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)

    with open(DATA_FILE) as f:
        questions = json.load(f)

    print(f"Generating images into {IMAGES_DIR}/\n")

    for q in questions:
        if q.get("image") and q.get("image_prompt"):
            dest = os.path.join(ROOT, "static", "images", q["image"])
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            download(q["image_prompt"], q["topic"], dest)

    # Default fallback image
    default_dest = os.path.join(IMAGES_DIR, "_default.jpg")
    download(
        "abstract editorial illustration of the Indian Constitution and rule of law, saffron and green, soft, no text, 16:9",
        "_default",
        default_dest
    )

    print("\nDone. All images are now bundled — no network needed at runtime.")

if __name__ == "__main__":
    main()

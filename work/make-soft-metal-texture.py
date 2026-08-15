from pathlib import Path

from PIL import Image, ImageEnhance


source = Image.open("public/textures/brushed-chrome.png").convert("RGB")
source = source.resize((1024, 1024), Image.Resampling.LANCZOS)
source = ImageEnhance.Contrast(source).enhance(0.42)
source = ImageEnhance.Sharpness(source).enhance(1.25)
base = Image.new("RGB", source.size, "#e2e6e7")
finish = Image.blend(base, source, 0.27)
output = Path("public/textures/brushed-chrome-soft.webp")
finish.save(output, "WEBP", quality=90, method=6)

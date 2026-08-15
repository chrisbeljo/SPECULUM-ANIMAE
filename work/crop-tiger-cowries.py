from pathlib import Path
from PIL import Image, ImageOps

source = Image.open("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-3a49b928-8a91-41cc-9e4e-2d8d9c2eb411.png").convert("RGB")
output = Path("public/oracles/chamalongos")
output.mkdir(parents=True, exist_ok=True)

half = source.width // 2
for name, box in {
    "tiger-cowrie-up.webp": (0, 0, half, source.height),
    "tiger-cowrie-down.webp": (half, 0, source.width, source.height),
}.items():
    crop = source.crop(box)
    final = ImageOps.fit(crop, (700, 700), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    final.save(output / name, "WEBP", quality=90, method=6)

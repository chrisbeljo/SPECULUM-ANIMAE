from pathlib import Path
from PIL import Image, ImageOps

root = Path("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792")
output = Path("public/oracles/animals")
output.mkdir(parents=True, exist_ok=True)

sheets = [
    (root / "exec-4a30dd32-cc92-442f-af01-41787528c649.png", [5, 261, 517, 773], [5, 517, 1029], 248, 502),
    (root / "exec-2c317ac0-a291-4bdf-ade9-b7769e1f7387.png", [4, 364, 726, 1090], [4, 367, 730], 352, 352),
    (root / "exec-766b5020-a4e3-41a0-be2a-c6e4535292e3.png", [5, 261, 517, 773], [5, 517, 1029], 248, 502),
    (root / "exec-c61b5c01-4595-44a7-95e8-574733e68c61.png", [4, 364, 726, 1090], [4, 367, 730], 352, 352),
]

number = 1
for path, xs, ys, width, height in sheets:
    source = Image.open(path).convert("RGB")
    for row, y in enumerate(ys):
        for column, x in enumerate(xs):
            if row == 2 and column == 3:
                continue
            crop = source.crop((x, y, min(x + width, source.width), min(y + height, source.height)))
            card = ImageOps.fit(crop, (600, 900), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45))
            card.save(output / f"animal-{number:02d}.webp", "WEBP", quality=88, method=6)
            number += 1

assert number == 45

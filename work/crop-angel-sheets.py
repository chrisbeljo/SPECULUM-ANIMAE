from pathlib import Path
from PIL import Image, ImageOps

output = Path("public/oracles/angels")
output.mkdir(parents=True, exist_ok=True)

sheets = [
    (Path("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-07ad5296-3f9a-47ed-be34-4e11d5aeaba2.png"), [5, 261, 517, 773], [5, 517, 1029], 248, 502),
    (Path("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-43bf8825-0da6-4b54-89ea-28c12a6a4008.png"), [5, 261, 517, 773], [5, 517, 1029], 248, 502),
    (Path("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-988f0ca7-a3d0-40a2-aff6-ad0854c08662.png"), [4, 364, 726, 1090], [4, 367, 730], 352, 352),
    (Path("/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-4305566f-e83a-465f-b57b-ab445332c9cd.png"), [4, 364, 726, 1090], [4, 367, 730], 352, 352),
]

card_number = 1
for sheet_path, xs, ys, width, height in sheets:
    image = Image.open(sheet_path).convert("RGB")
    for row, y in enumerate(ys):
        for column, x in enumerate(xs):
            if row == 2 and column == 3:
                continue
            crop = image.crop((x, y, min(x + width, image.width), min(y + height, image.height)))
            card = ImageOps.fit(crop, (600, 900), method=Image.Resampling.LANCZOS, centering=(0.5, 0.42))
            card.save(output / f"angel-{card_number:02d}.webp", "WEBP", quality=88, method=6)
            card_number += 1

assert card_number == 45

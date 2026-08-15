from pathlib import Path

from PIL import Image, ImageOps


front_source = Image.open(
    "/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-d21cb943-67a0-4bfc-98d7-620360d471e2.png"
).convert("RGB")
back_source = Image.open(
    "/Users/chris/.codex/generated_images/019fda26-f6c5-7753-b3af-c018c86e1792/exec-e99d6d98-be97-456a-bfa3-711911134ca3.png"
).convert("RGB")
output = Path("public/oracles/chamalongos")
output.mkdir(parents=True, exist_ok=True)

half = front_source.width // 2
faces = {
    "tiger-cowrie-up.webp": (front_source, (0, 0, half, front_source.height)),
    "tiger-cowrie-down.webp": (
        back_source,
        (half, 0, back_source.width, back_source.height),
    ),
}

for name, (source, box) in faces.items():
    face = source.crop(box)
    face = ImageOps.fit(
        face, (700, 700), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5)
    )
    face.save(output / name, "WEBP", quality=92, method=6)

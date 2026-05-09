"""One-shot script to regenerate /app/frontend/public/og.png via Nano Banana.

Uses the Emergent universal key + Gemini 3.1 Flash Image Preview. Run from
the project root:

    python /app/scripts/generate_og.py
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image
from emergentintegrations.llm.chat import LlmChat, UserMessage

REPO = Path(__file__).resolve().parent.parent
load_dotenv(REPO / "backend" / ".env")

OUT_PATH = REPO / "frontend" / "public" / "og.png"

PROMPT = (
    "A premium, modern enterprise SaaS Open Graph banner for 'Third Rail Systems OÜ'. "
    "Wide 16:9 cinematic composition. Dark sovereign-slate background (#16181D) with very "
    "subtle architectural grid lines. A single dominant typographic statement reading "
    "exactly 'Travel risk systems that account for real people, not generic averages.' set in a "
    "clean modern sans-serif (Inter-style), tightly tracked, balanced left-aligned, white. "
    "On the right third, a minimalist abstract diagram: a stylized shield silhouette dissolving "
    "into a vertical isolation lane lit by a single razor-thin cyan line (#00E5FF) — evokes "
    "stateless, isolated processing. A small monospaced label '· EU-NATIVE · TALLINN, ESTONIA ·' "
    "in the lower right corner, in muted slate. No people, no photographs, no UI mockups, no "
    "logos, no purple, no rainbow, no gradient noise. Editorial deep-tech aesthetic — "
    "Stripe / Linear / Vercel grade. Negative space respected. Sharp, restrained, sovereign."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not set in /app/backend/.env", file=sys.stderr)
        return 2

    chat = LlmChat(
        api_key=api_key,
        session_id="og-banner-trs",
        system_message=(
            "You are a senior brand designer producing a single, polished, dark-mode Open Graph "
            "banner. Render exactly the requested composition. Honour all colour and typography "
            "constraints precisely. Output one PNG."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT)
    print("Calling Nano Banana…")
    text, images = await chat.send_message_multimodal_response(msg)

    if text:
        # Print only the first 200 chars — never base64
        snippet = text if len(text) < 200 else text[:200] + "…"
        print(f"Model text: {snippet}")
    if not images:
        print("ERROR: model returned no images", file=sys.stderr)
        return 3

    raw = base64.b64decode(images[0]["data"])
    tmp_path = OUT_PATH.with_suffix(".raw.png")
    tmp_path.write_bytes(raw)

    # Normalise to canonical 1200x630 OG dimensions while preserving the
    # composition (centre-crop). Gemini emits whatever aspect it likes.
    try:
        img = Image.open(tmp_path).convert("RGB")
        target_w, target_h = 1200, 630
        src_w, src_h = img.size
        target_ratio = target_w / target_h
        src_ratio = src_w / src_h
        if src_ratio > target_ratio:
            # Wider than target → crop sides
            new_w = int(src_h * target_ratio)
            offset = (src_w - new_w) // 2
            img = img.crop((offset, 0, offset + new_w, src_h))
        else:
            # Taller than target → crop top/bottom
            new_h = int(src_w / target_ratio)
            offset = (src_h - new_h) // 2
            img = img.crop((0, offset, src_w, offset + new_h))
        img = img.resize((target_w, target_h), Image.LANCZOS)
        img.save(OUT_PATH, format="PNG", optimize=True)
        tmp_path.unlink(missing_ok=True)
        print(f"Saved: {OUT_PATH}  ({OUT_PATH.stat().st_size:,} bytes)")
    except Exception as exc:
        print(f"ERROR: post-processing failed: {exc}", file=sys.stderr)
        return 4

    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

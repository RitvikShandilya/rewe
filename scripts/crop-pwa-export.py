#!/usr/bin/env python3
import sys
from pathlib import Path

from PIL import Image


def composite_pixel(pixel, background):
    red, green, blue, alpha = pixel
    if alpha >= 255:
        return red, green, blue
    if alpha <= 0:
        return background

    opacity = alpha / 255
    return tuple(round(channel * opacity + bg * (1 - opacity)) for channel, bg in zip((red, green, blue), background))


def first_opaque_in_row(pixels, width, y, reverse=False):
    values = range(width - 1, -1, -1) if reverse else range(width)
    for x in values:
        red, green, blue, alpha = pixels[x, y]
        if alpha > 0:
            return red, green, blue
    return None


def nearest_row_color(pixels, width, height, y, left_side):
    for offset in range(height):
        for next_y in (y - offset, y + offset):
            if 0 <= next_y < height:
                color = first_opaque_in_row(pixels, width, next_y, reverse=not left_side)
                if color:
                    return color
    return 255, 255, 255


def flatten_transparent_edges(image):
    pixels = image.load()
    width, height = image.size
    output = Image.new("RGB", (width, height), (255, 255, 255))
    out = output.load()

    for y in range(height):
        left_color = first_opaque_in_row(pixels, width, y, reverse=False)
        right_color = first_opaque_in_row(pixels, width, y, reverse=True)

        if left_color is None:
            left_color = nearest_row_color(pixels, width, height, y, left_side=True)
        if right_color is None:
            right_color = nearest_row_color(pixels, width, height, y, left_side=False)

        for x in range(width):
            background = left_color if x < width / 2 else right_color
            out[x, y] = composite_pixel(pixels[x, y], background)

    return output


def main():
    if len(sys.argv) != 7:
        raise SystemExit("usage: crop-pwa-export.py <source> <target> <crop-top> <width> <height> <scale>")

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    crop_top = int(sys.argv[3])
    width = int(sys.argv[4])
    height = int(sys.argv[5])

    image = Image.open(source).convert("RGBA")
    cropped = image.crop((0, crop_top, width, crop_top + height))
    flattened = flatten_transparent_edges(cropped)
    flattened.save(target, format="PNG", optimize=True)


if __name__ == "__main__":
    main()

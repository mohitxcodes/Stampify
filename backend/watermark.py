from PIL import Image, ImageEnhance, ImageOps
import sys

def open_rgba(path):
    return Image.open(path).convert("RGBA")

def set_opacity(img, opacity):
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[3].point(lambda p: int(p * opacity))
    img.putalpha(alpha)
    return img

def scale_keep_aspect(img, target_width=None, target_height=None):
    w, h = img.size
    if target_width and not target_height:
        ratio = target_width / w
        return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    if target_height and not target_width:
        ratio = target_height / h
        return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    return img

def tile_watermark(canvas_size, watermark_img, padding=50):
    canvas = Image.new("RGBA", canvas_size, (0,0,0,0))
    w, h = watermark_img.size
    if w == 0 or h == 0:
        return canvas
    x = 0
    while x < canvas_size[0]:
        y = 0
        while y < canvas_size[1]:
            canvas.alpha_composite(watermark_img, (x, y))
            y += h + padding
        x += w + padding
    return canvas

def add_watermark_overlay(fg_path, wm_path, out_path,
                          wm_scale=0.2, wm_opacity=0.2,
                          tile=True, padding=50, position=None):
    fg = open_rgba(fg_path)
    width, height = fg.size

    wm = open_rgba(wm_path)

    if tile:
        target_w = int(width * wm_scale)
        wm_resized = scale_keep_aspect(wm, target_width=target_w)
        wm_resized = set_opacity(wm_resized, wm_opacity)
        wm_canvas = tile_watermark((width, height), wm_resized, padding=padding)
        result = fg.copy()
        result = Image.alpha_composite(result, wm_canvas)
    else:
        target_w = int(width * wm_scale)
        wm_resized = scale_keep_aspect(wm, target_width=target_w)
        wm_resized = set_opacity(wm_resized, wm_opacity)
        if position is None:
            pos = ((width - wm_resized.width)//2, (height - wm_resized.height)//2)
        else:
            pos = position
        result = fg.copy()
        result.alpha_composite(wm_resized, dest=pos)

    result.save(out_path)
    print(f"Saved overlay watermark to: {out_path}")

def add_watermark_behind(fg_path, wm_path, out_path,
                         wm_scale=0.2, wm_opacity=0.15,
                         fg_opacity=0.92, tile=True, padding=50, position=None):
    fg = open_rgba(fg_path)
    width, height = fg.size

    wm = open_rgba(wm_path)

    if tile:
        target_w = int(width * wm_scale)
        wm_resized = scale_keep_aspect(wm, target_width=target_w)
        wm_resized = set_opacity(wm_resized, wm_opacity)
        wm_canvas = tile_watermark((width, height), wm_resized, padding=padding)
    else:
        target_w = int(width * wm_scale)
        wm_resized = scale_keep_aspect(wm, target_width=target_w)
        wm_resized = set_opacity(wm_resized, wm_opacity)
        wm_canvas = Image.new("RGBA", (width, height), (0,0,0,0))
        if position is None:
            pos = ((width - wm_resized.width)//2, (height - wm_resized.height)//2)
        else:
            pos = position
        wm_canvas.alpha_composite(wm_resized, dest=pos)

    fg_trans = set_opacity(fg.copy(), fg_opacity)
    result = Image.alpha_composite(wm_canvas, fg_trans)

    result.save(out_path)
    print(f"Saved behind-watermark to: {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python watermark.py [overlay|behind] foreground_image watermark_image output_image")
        sys.exit(1)

    mode = sys.argv[1].lower()
    fg_path = sys.argv[2]
    wm_path = sys.argv[3]
    out_path = sys.argv[4]

    if mode == "overlay":
        add_watermark_overlay(fg_path, wm_path, out_path,
                              wm_scale=0.18, wm_opacity=0.22, tile=True, padding=60)
    elif mode == "behind":
        add_watermark_behind(fg_path, wm_path, out_path,
                             wm_scale=0.18, wm_opacity=0.15, fg_opacity=0.93, tile=True, padding=60)
    else:
        print("Unknown mode. Use 'overlay' or 'behind'.")
import json
import sys

metin = sys.argv[1]
elemanlar = json.load(sys.stdin)
for el in elemanlar:
    label = (el.get("AXLabel") or "") + " " + (el.get("AXValue") or "")
    if metin in label:
        f = el["frame"]
        print(f"{f['x'] + f['width'] / 2} {f['y'] + f['height'] / 2}")
        break

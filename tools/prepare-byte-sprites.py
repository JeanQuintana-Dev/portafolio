"""Pack generated raster poses into aligned game frames; never redraw the character."""
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

parser = argparse.ArgumentParser()
parser.add_argument('sheet', type=Path)
parser.add_argument('reference', type=Path)
parser.add_argument('--output', type=Path, default=Path('public'))
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
CELL = (160, 192)
ANCHOR = (80, 86)
BEZEL = (88, 73)

def component_boxes(array, minimum):
    labels, _ = label(array)
    result = []
    for index, box in enumerate(find_objects(labels), 1):
        if box is None:
            continue
        ys, xs = box
        area = int((labels[box] == index).sum())
        if area >= minimum:
            result.append((xs.start, ys.start, xs.stop, ys.stop, area))
    return result

def register(image):
    pixels = np.array(image.convert('RGBA'))
    # Transparent sprite export: discard only faint background residue.
    pixels[pixels[:, :, 3] < 16] = 0
    cream = (pixels[:,:,0] > 190) & (pixels[:,:,1] > 160) & (pixels[:,:,2] > 110) & (pixels[:,:,3] > 128)
    candidates = component_boxes(cream, 30)
    candidates = [b for b in candidates if b[3] < pixels.shape[0] * .76 and b[2]-b[0] > 20]
    x0,y0,x1,y1,_ = max(candidates, key=lambda b: b[4])
    sx, sy = BEZEL[0]/(x1-x0), BEZEL[1]/(y1-y0)
    dx = ANCHOR[0] - (x0+x1)/2*sx
    dy = ANCHOR[1] - (y0+y1)/2*sy
    resized = Image.fromarray(pixels).resize((round(pixels.shape[1]*sx), round(pixels.shape[0]*sy)), Image.Resampling.NEAREST)
    frame = Image.new('RGBA', CELL)
    frame.alpha_composite(resized, (round(dx), round(dy)))
    return frame, {'sourceBezel':[x0,y0,x1,y1], 'scale':[round(sx,4),round(sy,4)], 'anchor':ANCHOR}

sheet = Image.open(args.sheet).convert('RGBA')
pixels = np.array(sheet)
boxes = component_boxes(pixels[:,:,3] > 128, 4000)
assert len(boxes) == 24, f'Expected 24 sprite poses, found {len(boxes)}'
# Segment the actual silhouettes rather than cutting through the irregular AI grid.
boxes.sort(key=lambda b: (round(b[1]/256), b[0]))
frames=[]
registration=[]
for box in boxes:
    x0,y0,x1,y1,_ = box
    crop = sheet.crop((max(0,x0-3),max(0,y0-3),min(sheet.width,x1+3),min(sheet.height,y1+3)))
    frame, details = register(crop)
    frames.append(frame)
    registration.append(details)
ref=Image.open(args.reference).convert('RGBA')
a=np.array(ref)[:,:,3]>128
y,x=np.where(a)
reference, details=register(ref.crop((int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1))))
frames.append(reference)
registration.append(details)
atlas=Image.new('RGBA',(CELL[0]*6,CELL[1]*5))
for i in range(30):
    atlas.alpha_composite(frames[min(i,24)],((i%6)*CELL[0],(i//6)*CELL[1]))
atlas.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(args.output/'byte-sprites.png',optimize=True)
manifest={'cell':CELL,'columns':6,'rows':5,'poses':25,'neutralFrame':24,'registration':registration}
(args.output/'byte-sprites.json').write_text(json.dumps(manifest,indent=2)+'\n')
# Local contact sheet is a QA output, not an application resource.
contact=Image.new('RGBA',atlas.size,'#f6ecea')
contact.alpha_composite(atlas)
contact.convert('RGB').save('/workspace/scratch/804e214e5887/byte-sprites-contact.jpg')
print(json.dumps({'atlas':str(args.output/'byte-sprites.png'),'bytes':(args.output/'byte-sprites.png').stat().st_size,'frames':len(frames),'size':atlas.size}))

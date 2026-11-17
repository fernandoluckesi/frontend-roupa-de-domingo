# Acrescenta as letras acentuadas do portugues na Dinofans (licenca: uso pessoal e comercial livre).
# Os acentos vem dos proprios glifos da fonte (^ ` ~ ,), entao mantem o traco do desenhista.
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

src, dst = sys.argv[1], sys.argv[2]
f = TTFont(src)
gs = f.getGlyphSet()
cmap = f.getBestCmap()
glyf, hmtx = f['glyf'], f['hmtx']

def bounds(name, t=(1,0,0,1,0,0)):
    p = BoundsPen(gs); gs[name].draw(TransformPen(p, t)); return p.bounds

ACC = {'grave': cmap[ord('`')], 'circ': cmap[ord('^')], 'tilde': cmap[ord('~')], 'comma': cmap[ord(',')]}
# (acento, espelha horizontal, escala)
MARK = {'acute': ('grave', True, 0.68), 'grave': ('grave', False, 0.68), 'circ': ('circ', False, 0.68),
        'tilde': ('tilde', False, 0.72), 'dier': None}
LETTERS = {
  'Á':('A','acute'),'À':('A','grave'),'Â':('A','circ'),'Ã':('A','tilde'),
  'É':('E','acute'),'È':('E','grave'),'Ê':('E','circ'),
  'Í':('I','acute'),'Ì':('I','grave'),'Î':('I','circ'),
  'Ó':('O','acute'),'Ò':('O','grave'),'Ô':('O','circ'),'Õ':('O','tilde'),
  'Ú':('U','acute'),'Ù':('U','grave'),'Û':('U','circ'),
  'Ñ':('N','tilde'),'Ç':('C','cedilla'),
}
GAP = 40
order = f.getGlyphOrder()
for ch, (base, mark) in LETTERS.items():
    for c, b in ((ch, base), (ch.lower(), base.lower())):
        bname = cmap[ord(b)]
        bx0, by0, bx1, by1 = bounds(bname)
        pen = TTGlyphPen(gs)
        gs[bname].draw(pen)
        if mark == 'cedilla':
            src_m, flip, s = ACC['comma'], True, 0.8
        else:
            k, flip, s = MARK[mark]; src_m = ACC[k]
        mx0, my0, mx1, my1 = bounds(src_m, (-s if flip else s, 0, 0, s, 0, 0))
        dx = (bx0 + bx1) / 2 - (mx0 + mx1) / 2
        dy = (by0 + 12 - my1) if mark == 'cedilla' else (by1 + GAP - my0)
        gs[src_m].draw(TransformPen(pen, (-s if flip else s, 0, 0, s, dx, dy)))
        name = 'uni%04X' % ord(c)
        glyf[name] = pen.glyph()
        hmtx[name] = hmtx[bname]
        pass
        for t in f['cmap'].tables:
            if t.isUnicode() or (t.platformID == 3): t.cmap[ord(c)] = name
order = list(glyf.glyphOrder); f.setGlyphOrder(order)
f['maxp'].numGlyphs = len(order)
# Espaco para os acentos das maiusculas
top = max(bounds('uni%04X' % ord(c))[3] for c in LETTERS)
f['hhea'].ascent = f['OS/2'].sTypoAscender = f['OS/2'].usWinAscent = int(top) + 20
for k in ('hdmx', 'VDMX', 'LTSH'):
    if k in f: del f[k]
f.save(dst)
print('ok', len(order), 'top', top)

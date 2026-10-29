import html, re
T=open('src/template.html').read(); JS=open('src/app.js').read()
ORIGIN='https://nikhil-nidhi-card.vercel.app'
# route: (first name, second name, side whose family is named first, variant)
PAGES={'groom':('Nikhil','Nidhi','groom',''),'bride':('Nidhi','Nikhil','bride',''),'muhurtam':('Nidhi','Nikhil','bride','muhurtam')}

def muhurtam(page):
    """10 December Muhurtham only: no 9th, no 15th, no RSVP."""
    page,n=re.subn(r'<!-- ══════════ RSVP ══════════ -->.*?(?=<!-- ══════════ CLOSING MANTRA)','',page,flags=re.S); assert n==1,'rsvp section'
    subs=[
      ('<a href="#rsvp" data-s="rsvp" class="go">RSVP</a>',''),
      ('Wedding Celebrations · 9, 10 &amp; 15 December 2026','Muhurtham · 10 December 2026'),
      ('invite you to celebrate their wedding. Bangalore, 9 &amp; 10 December 2026. Reception in Lucknow, 15 December 2026.','invite you to the Muhurtham. Bangalore, 10 December 2026.'),
      ('content="{{NAMES}} · Wedding Celebrations"','content="{{NAMES}} · Muhurtham"'),
      ('You are warmly invited. 9 &amp; 10 December 2026, Bangalore. 15 December 2026, Lucknow. Tap to open the doors.','You are warmly invited to the Muhurtham. 10 December 2026, Bangalore. Tap to open the doors.'),
      ('9 · 10 · 15 December 2026','10 December 2026'),
      ('Three days of festivities','The Muhurtham'),
    ]
    for a,b in subs:
        assert a in page,a
        page=page.replace(a,b)
    return page

for route,(a,b,side,variant) in PAGES.items():
    names=f'{a} &amp; {b}'
    page=T
    if variant=='muhurtam': page=muhurtam(page)
    page=page.replace('/*APP_JS*/',JS).replace('{{SIDE}}',side).replace('{{VARIANT}}',variant).replace('{{NAMES_HTML}}',names).replace('{{NAMES}}',names).replace('{{ORIGIN}}',ORIGIN)
    open(f'../{route}/index.html','w').write(page)
chooser=f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Ccircle cx=%2732%27 cy=%2732%27 r=%2730%27 fill=%27%237a2f2a%27/%3E%3Ctext x=%2732%27 y=%2741%27 font-size=%2726%27 font-family=%27Georgia,serif%27 fill=%27%23fdfaf1%27 text-anchor=%27middle%27%3ENN%3C/text%3E%3C/svg%3E"><title>Wedding invite links</title>
<style>
body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#f8f2e3;color:#5b4e38;font-family:'Cormorant Garamond',Georgia,serif;text-align:center;padding:2rem}}
h1{{font-weight:500;font-size:2rem;color:#48552f;margin:0 0 .4rem}}p{{margin:.2rem 0 1.6rem;color:#7c6f56}}
.card{{display:block;max-width:420px;margin:.9rem auto;padding:1.4rem;background:#fdfaf1;border:1px solid #e6d3ac;text-decoration:none;color:#48552f}}
.card b{{display:block;font-size:1.5rem;font-weight:500}}.card span{{font:300 .8rem/1.6 system-ui,sans-serif;letter-spacing:.06em;color:#7c6f56}}
button{{margin-top:.6rem;font:500 .7rem system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;border:1px solid #b8894a;background:none;color:#48552f;padding:.8em 1.4em;cursor:pointer}}
</style></head><body><main>
<h1>Invite links</h1><p>Private page for the couple. Send each side its own link.</p>
<a class="card" href="groom/"><b>Nikhil &amp; Nidhi</b><span>Groom's side. Groom's family named first.<br>{ORIGIN}/groom</span></a>
<button data-copy="{ORIGIN}/groom">Copy groom's link</button>
<a class="card" href="bride/"><b>Nidhi &amp; Nikhil</b><span>Bride's side. Bride's family named first.<br>{ORIGIN}/bride</span></a>
<button data-copy="{ORIGIN}/bride">Copy bride's link</button>
<a class="card" href="muhurtam/"><b>Muhurtham only</b><span>10 December, Bangalore. No RSVP. Bride's family named first.<br>{ORIGIN}/muhurtam</span></a>
<button data-copy="{ORIGIN}/muhurtam">Copy Muhurtham link</button>
</main><script>document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.dataset.copy).then(()=>{{b.textContent='Copied'}}))</script></body></html>'''
open('../index.html','w').write(chooser)
print('built')

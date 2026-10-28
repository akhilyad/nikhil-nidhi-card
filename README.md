# Nikhil & Nidhi wedding card

Two links from one template:

- Groom's side: `/groom/` (Nikhil & Nidhi, groom's family named first)
- Bride's side: `/bride/` (Nidhi & Nikhil, bride's family named first)

Static site, no build step on Vercel. Deploy this repo as-is; the live addresses are
`https://<project>.vercel.app/groom/` and `https://<project>.vercel.app/bride/`.

RSVPs go to a Google Apps Script web app that writes to the Google Sheet (`source/apps-script/Code.gs`).

## Editing
`source/src/template.html` and `source/src/app.js` are the source. `source/build.py` writes
`groom/index.html`, `bride/index.html` and `index.html` (a private page with both links).
Run `python3 build.py` from inside `source/`; it writes the three pages into the repo root.
Set `ORIGIN` in `build.py` to the live address so the WhatsApp preview image works.

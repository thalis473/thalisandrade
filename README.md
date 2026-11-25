# thalisandrade

Personal portfolio, published with GitHub Pages: https://thalis473.github.io/thalisandrade/

Plain HTML, CSS and JavaScript (ES modules). No build step, no dependencies, no tracking, no cookies.

## Features
- Cyberpunk theme, responsive, with keyboard focus styles and reduced-motion support.
- Portuguese and English (toggle in the menu; defaults to the browser language).
- Contact form that opens WhatsApp with the message already written. Nothing is stored or sent to any server.
- A Snake game at the end of the page. The best score lives only in the visitor's own browser (`localStorage`).
- Strict Content-Security-Policy (no inline scripts or styles, no third-party requests).

## Preview locally
ES modules need HTTP, so open the folder with a tiny server:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Tests
Requires Node 20+ (uses the built-in test runner):
```bash
npm test
```
They cover the game rules, the WhatsApp link builder, language detection and HTML/JS consistency
(every translation key exists, every element id used by the scripts exists, no inline scripts).

## Configuration
Contact details live in `js/config.js`. Set `email` there to show an email link (it is hidden while empty).

## Structure
- `index.html`: all content in Portuguese (default); English texts live in `js/translations-en.js`.
- `css/`: `base.css`, `sections.css`, `game.css`.
- `js/snake-logic.js`: pure game rules (tested). `snake-view.js`, `snake-controls.js`, `snake-game.js`: canvas, input and loop.
- `js/whatsapp-url.js`: pure message/URL builder (tested). `contact-form.js`: form behavior.
- `js/i18n.js`, `messages.js`, `translations-en.js`: language handling.

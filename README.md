# Level Up: Game Shop website

The game's site: the trailer, what the game is about, and where to get it. Plain
HTML, CSS and a few lines of JavaScript, with no build step and no framework.
It follows the game's UI: Super Mellow and Atkinson Hyperlegible Next, 3px Ink
outlines, Chrome header bands and buttons with a solid drop edge that sink when
pressed. Browsers set to dark mode get the game's Black surface.

| Path | What it is |
| --- | --- |
| `index.html` | The page |
| `404.html` | Shown by GitHub Pages for any address that does not exist |
| `css/site.css` | All styles; colours are the game's tokens at the top |
| `js/site.js` | Plays the feature clips only while they are on screen, their Pause/Play buttons, starts the trailer from "Watch the trailer" and makes the three people pop up |
| `js/i18n.js` | Picks the language and swaps the page's text for it |
| `locales/` | The French, German and Spanish text, one JSON file per language |
| `img/`, `video/`, `fonts/` | Built from the game repo by `tools/make_media.py` |

Visitors who turn on reduced motion in their system get still pictures in place
of the clips (each one still has a Play button) and no hero animation.

The three people in the hero start hidden below its bottom edge and pop up one
after the other once their pictures are loaded (and the page is translated), so
a slow connection never shows them halfway.

## Languages

The site speaks English, French, German and Spanish, like the game. English is
the text written in `index.html` and `404.html`; the other three are in
`locales/fr.json`, `de.json` and `es.json`, which use the game's own words
(boutique, Laden, tienda; Détente, Locker, Relajado) and address the player
the same way (vous, du, tú).

Which language a visitor gets:

1. `?lang=fr` (or `de`, `es`, `en`) in the address. It is remembered for later
   visits, and that is what the language links in the footer do.
2. Otherwise the language picked there before.
3. Otherwise the first of the browser's languages that the site has.
4. Otherwise English.

While a translation loads, the page stays hidden (3 seconds at most, then it
shows in English), so nobody sees the English flash first.

Each translated element carries a key: `data-i18n="KEY"` replaces its content
(keys may hold `<strong>` and `<br>`), and `data-i18n-attr="name: KEY"` sets an
attribute (several pairs are separated by `;`). When you change or add English
text, change the same key in the three JSON files, then run

```sh
python3 tools/check_locales.py
```

It lists every key a language is missing, with the English to translate, the
keys nothing uses any more, and any of the banned characters (long dashes,
curly quotes, the multiplication sign, the ellipsis character).

Search engines and link previews read the English, because the other languages
are filled in by the browser.

## Preview it

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from the disk
mostly works, but fonts and the 404 page need a server.

## Before it goes live

1. **Steam link.** Replace `STEAM_APP_ID` in `index.html` (two places: the
   hero button and the Get the game card) with the app id from Steamworks.
2. **Domain.** `index.html` names the domain three times (`canonical`,
   `og:url`, `og:image`). They say `https://levelupgameshop.com/`; change them if you
   pick another one. Link previews on Discord, X and so on need the full
   address in `og:image`.
3. **CNAME.** Add a file named `CNAME` holding just the domain
   (`levelupgameshop.com`), or set it in the GitHub Pages settings, which writes the
   file for you.

## Publish on GitHub Pages

1. Create a public repo (for example `levelupgameshop-site`) and push this
   folder to its `main` branch.
2. Settings > Pages: deploy from the branch `main`, folder `/ (root)`.
3. Settings > Pages > Custom domain: type the domain and save.
4. At Namecheap, Domain List > Manage > Advanced DNS, remove the parking
   records and add:

   | Type | Host | Value |
   | --- | --- | --- |
   | A Record | @ | 185.199.108.153 |
   | A Record | @ | 185.199.109.153 |
   | A Record | @ | 185.199.110.153 |
   | A Record | @ | 185.199.111.153 |
   | CNAME Record | www | `LORAY-guy.github.io.` |

5. Once GitHub shows the DNS check as passed (minutes to a few hours), tick
   **Enforce HTTPS**.
6. Also verify the domain under your GitHub account's Settings > Pages, so
   nobody else can point a repo at it.

## Adding a store later

Each store is one `<li class="store">` in the Get the game card. Copy the Steam
one and change the name, the platforms line and the link. If you add the
Google Play or App Store badge instead of a text button, it has to be the
official artwork downloaded from Google or Apple, used as their guidelines say.

## Rebuilding the pictures and videos

Everything in `img/`, `video/` and `fonts/` comes from the game repo next to
this folder (`../LevelUpGameShop`): the store art from 15 November, the
trailer from 17 November and the two fonts.

```sh
uv run --with pillow --with fonttools --with brotli python tools/make_media.py
uv run --with pillow --with fonttools --with brotli python tools/make_media.py --only clips,trailer
```

Steps: `hero`, `characters`, `logo`, `share`, `trailer`, `clips`, `fonts`.
After a new trailer, change `TRAILER` at the top of the script and the
`CLIPS` table: each clip is a name, its start and end in seconds of the trailer
and the left edge of the crop. Crops are 1386 x 780 from the top of the frame,
which keeps the trailer's captions (they start at y = 833) out of the clips.

The hero is the dusk sky and street from the store art, and the three people
standing in it are cutouts from the same set (`CHARACTERS` maps each cutout to
its file name). The script writes them 900 pixels tall; the current
`sports_guy.webp` is your own full-size export (1842 tall), so rebuilding the
`characters` step replaces it with the smaller one. `img/share.jpg`
is the picture shown when someone pastes the link into Discord or a social
network (1200 x 630, cut from the main capsule).

## Fonts

- Atkinson Hyperlegible Next: SIL Open Font License, `fonts/OFL-AtkinsonHyperlegibleNext.txt`.
- Super Mellow by fsuarez913: listed on DaFont as free for personal and
  commercial use. The font file carries no licence text.

Both are cut down to Latin (French, German and Spanish included) to stay small.

## Size and traffic

The page itself loads under 1 MB. The 1080p trailer is 42 MB and only loads when
someone presses play (phones get the 30 MB 720p version). GitHub Pages has a
soft limit of 100 GB of traffic a month, roughly 2,400 full plays of the 1080p
trailer. If the site gets busier than that, put the trailer on YouTube and
embed it, or move `video/` to a CDN.

## Privacy

No cookies, no analytics, and fonts and videos are served from the site itself,
so the page makes no requests to other companies and needs no cookie banner.
GitHub keeps its own server logs for Pages.

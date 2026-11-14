// Assembles the preview site published to GitHub Pages: the build of every starter in every
// format at <format>/<starter>/, and a gallery page that links to each one.
//
// Usage: node .github/scripts/build-preview-site.mjs <builds folder> <site folder>
//
// The builds folder holds one folder per build, named <format>-<starter>, as the Preview workflow
// downloads them. The gallery shows each starter's screenshot from images/starters/.

import fs from 'node:fs';
import path from 'node:path';

import { FORMATS, STARTERS } from '../../templates/index.ts';

// where GitHub Pages serves the site, for the link preview's image
const SITE = 'https://playcanvas.github.io/create-playcanvas/';

const [builds, site] = process.argv.slice(2).map((dir) => path.resolve(dir));
const repo = path.resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));

fs.rmSync(site, { recursive: true, force: true });
for (const format of FORMATS) {
    for (const starter of STARTERS) {
        const build = path.join(builds, `${format.name}-${starter.name}`);
        // a link to a missing build would be a broken page, so insist on every one
        if (!fs.existsSync(path.join(build, 'index.html'))) {
            throw new Error(`No build of ${starter.name} in ${format.name} at ${build}`);
        }
        fs.cpSync(build, path.join(site, format.name, starter.name), { recursive: true });
    }
}
for (const starter of STARTERS) {
    const thumbnail = path.join(repo, 'images/starters', `${starter.name}.webp`);
    if (!fs.existsSync(thumbnail)) throw new Error(`No thumbnail of ${starter.name} at ${thumbnail}`);
    fs.cpSync(thumbnail, path.join(site, 'images', `${starter.name}.webp`));
}
fs.cpSync(path.join(repo, 'templates/_common/src/assets/playcanvas.png'), path.join(site, 'playcanvas.png'));

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sentence = (text) => text[0].toUpperCase() + text.slice(1);

// a command to copy. The button stays hidden until the page's script finds a clipboard to write to
const command = (text) =>
    `<p class="command"><code>${text}</code><button type="button" title="Copy" aria-label="Copy the command" hidden></button></p>`;

// The formats show the same scene, so a card has one way in: the button on its screenshot, which
// the page's script points at the format chosen in the header. As written here, for a page whose
// script hasn't run, a card opens the first format, the CLI's default, and its command leaves the
// format for the CLI to ask. The text comes before the screenshot, which the styles move above it,
// so that a screen reader hears what a starter is before the link that opens it
const cards = STARTERS.map(
    (starter) => `
                <li class="card">
                    <div class="about">
                        <p class="category">${escape(starter.category)}</p>
                        <h2>${escape(starter.display)}</h2>
                        <p>${escape(sentence(starter.description))}</p>
                    </div>
                    <div class="shot">
                        <img src="images/${starter.name}.webp" alt="" width="640" height="480" />
                        <a class="open" href="${FORMATS[0].name}/${starter.name}/" data-starter="${starter.name}" aria-label="Open demo: ${escape(starter.display)}">Open demo</a>
                    </div>
                    ${command(`<span class="base">npm create playcanvas@latest --</span> <span class="flag">--starter ${starter.name}</span> <span class="flag" data-format hidden></span>`)}
                </li>`
).join('');

const formats = FORMATS.map(
    (format, i) =>
        `<label><input type="radio" name="format" value="${format.name}" data-about="${escape(sentence(format.description))}"${i ? '' : ' checked'} /><span>${escape(format.display)}</span></label>`
).join('\n                    ');

// the colors and the panel's border and radius are the starters' own, from starter.css
const page = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Try every starter that npm create playcanvas scaffolds, in your browser." />
        <meta property="og:title" content="create-playcanvas starters" />
        <meta property="og:description" content="Try every starter that npm create playcanvas scaffolds, in your browser." />
        <meta property="og:image" content="${SITE}images/first-person-game.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" href="playcanvas.png" />
        <title>create-playcanvas starters</title>
        <style>
            :root {
                color-scheme: dark;
            }
            * {
                box-sizing: border-box;
            }
            /* for the elements below that set a display of their own */
            [hidden] {
                display: none !important;
            }
            body {
                margin: 0;
                background: #11151c;
                color: #f8fafc;
                font: 1rem/1.5 Inter, ui-sans-serif, system-ui, sans-serif;
            }
            header,
            main,
            footer {
                max-width: 80rem;
                margin: 0 auto;
                padding: 0 1.25rem;
            }
            header {
                padding-top: 2.25rem;
                padding-bottom: 2rem;
                text-align: center;
            }
            h1 {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                margin: 0 0 0.5rem;
                font-size: clamp(1.75rem, 6vw, 2.5rem);
                letter-spacing: -0.02em;
            }
            h1 img {
                width: 1.1em;
                height: 1.1em;
            }
            .lede,
            .format p {
                max-width: 38rem;
                margin: 0 auto;
                color: #aeb8c8;
            }
            .lede {
                font-size: 1.1rem;
            }
            .format p {
                margin-top: 0.6rem;
                font-size: 0.9rem;
            }
            /* a segmented control: the radio buttons themselves are out of sight, and each one's
               label is a segment */
            .formats {
                display: inline-flex;
                margin-top: 1.25rem;
                padding: 0.25rem;
                border: 1px solid #ffffff24;
                border-radius: 0.75rem;
                background: #0b1019;
            }
            .formats input {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }
            .formats span {
                display: block;
                padding: 0.4rem 0.9rem;
                border-radius: 0.5rem;
                color: #aeb8c8;
                font-size: 0.95rem;
                cursor: pointer;
                transition:
                    background 0.15s,
                    color 0.15s;
            }
            .formats span:hover {
                color: #f8fafc;
            }
            .formats input:checked + span {
                background: #263247;
                color: #f8fafc;
            }
            .gallery {
                display: grid;
                /* wide enough for the longest line of a card's command */
                grid-template-columns: repeat(auto-fill, minmax(min(100%, 21rem), 1fr));
                gap: 1.25rem;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .card {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #ffffff24;
                border-radius: 14px;
                background: #171d27;
                transition:
                    border-color 0.15s,
                    transform 0.15s;
            }
            .card:hover,
            .card:focus-within {
                border-color: #ffffff55;
                transform: translateY(-2px);
            }
            /* the screenshot and the button that opens the demo share one cell, the button in its
               bottom right corner */
            .shot {
                position: relative;
                display: grid;
                grid-template: minmax(0, 1fr) / minmax(0, 1fr);
                order: -1;
                overflow: hidden;
                aspect-ratio: 4 / 3;
                background: #0b1019;
            }
            .shot > * {
                grid-area: 1 / 1;
            }
            .shot img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
            }
            .shot:hover img {
                transform: scale(1.04);
            }
            .about {
                flex: 1;
                padding: 1rem 1.1rem 0.9rem;
            }
            .about p {
                margin: 0;
                color: #aeb8c8;
                font-size: 0.92rem;
            }
            .about .category {
                color: #ff8a47;
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            h2 {
                margin: 0.2rem 0 0.3rem;
                font-size: 1.15rem;
            }
            .open,
            .command button {
                border: 1px solid #ffffff24;
                background-color: #263247;
                color: inherit;
                cursor: pointer;
                transition:
                    background-color 0.15s,
                    border-color 0.15s;
            }
            .open:hover,
            .command button:hover {
                border-color: #ffffff55;
                background-color: #34435e;
            }
            /* the link's own box is the button. Its ::after spreads the link over the whole
               screenshot, so a click anywhere on that opens the demo. The button must stay
               unpositioned and unfiltered, a backdrop blur included, or the ::after would spread
               over the button alone */
            .open {
                /* above the image, which paints over it once the hover scales it */
                z-index: 1;
                align-self: end;
                justify-self: end;
                margin: 0.75rem;
                padding: 0.4rem 0.85rem 0.4rem 1.9rem;
                border-radius: 9px;
                background: #0b1019e6
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 5.5l11 6.5-11 6.5z' fill='%23ff8a47'/%3E%3C/svg%3E")
                    0.6rem center / 1rem no-repeat;
                font-size: 0.85rem;
                text-decoration: none;
            }
            .open::after {
                position: absolute;
                inset: 0;
                content: '';
            }
            .command {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0 1.1rem 1.1rem;
                padding: 0.45rem 0.45rem 0.45rem 0.7rem;
                border: 1px solid #ffffff24;
                border-radius: 9px;
                background: #0b1019;
                text-align: left;
            }
            /* one click selects the whole command, for where there is no button to copy it */
            .command code {
                flex: 1;
                font: 0.75rem/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                overflow-wrap: anywhere;
                user-select: all;
            }
            .command code::before {
                color: #ff8a47;
                content: '$ ';
            }
            /* the part every card shares is dimmed, so the part that differs stands out */
            .command .base {
                color: #aeb8c8;
            }
            /* each option goes on a line of its own, under the npm. The break is generated content,
               so it is never copied */
            .command .flag::before {
                content: '\\A  ';
                white-space: pre;
            }
            /* the icons are two sheets of paper, and a tick once the command is copied */
            .command button {
                flex: none;
                width: 1.9rem;
                height: 1.9rem;
                padding: 0;
                border-radius: 7px;
                background: #263247
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='11' height='11' rx='2'/%3E%3Cpath d='M5 15V6a2 2 0 0 1 2-2h9'/%3E%3C/svg%3E")
                    center / 1rem no-repeat;
            }
            .command button.copied {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234ade80' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E");
            }
            /* the last tile is the command with no starter, and fills the row the starters leave */
            .start {
                justify-content: center;
                border-style: dashed;
                background: none;
            }
            .start .about {
                flex: none;
                padding-bottom: 1rem;
            }
            a:focus-visible,
            button:focus-visible,
            .formats input:focus-visible + span {
                outline: 2px solid #ff8a47;
                outline-offset: 2px;
            }
            footer {
                padding-top: 2.5rem;
                padding-bottom: 3rem;
                color: #aeb8c8;
                font-size: 0.9rem;
                text-align: center;
            }
            footer a {
                color: #f8fafc;
            }
            @media (prefers-reduced-motion: reduce) {
                * {
                    transition: none !important;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <h1><img src="playcanvas.png" alt="" width="460" height="460" />create-playcanvas</h1>
            <p class="lede">
                Starter projects for PlayCanvas, running here exactly as the tool scaffolds them. Open one to
                try it, and copy its command to create it.
            </p>
            <div class="format" hidden>
                <div class="formats" role="radiogroup" aria-label="Format">
                    ${formats}
                </div>
                <p><span id="format-about"></span>. Every format shows the same scene, so pick the code you want to write.</p>
            </div>
        </header>
        <main>
            <ul class="gallery">${cards}
                <li class="card start">
                    <div class="about">
                        <p class="category">Not sure yet?</p>
                        <h2>Start from the prompts</h2>
                        <p>Run the command with no options, and it asks for a name, a format and a starter as it goes.</p>
                    </div>
                    ${command('npm create playcanvas@latest')}
                </li>
            </ul>
        </main>
        <footer>
            Built from create-playcanvas ${version}.
            <a href="https://github.com/playcanvas/create-playcanvas#readme">Read how to create your own project</a>.
        </footer>
        <script>
            // the format chosen in the header is the one every card opens and every command asks for
            const formats = [...document.querySelectorAll('input[name="format"]')];
            const choose = () => {
                const format = formats.find((input) => input.checked);
                for (const link of document.querySelectorAll('a[data-starter]')) {
                    link.href = format.value + '/' + link.dataset.starter + '/';
                }
                for (const flag of document.querySelectorAll('[data-format]')) {
                    flag.textContent = '--format ' + format.value;
                    flag.hidden = false;
                }
                document.querySelector('#format-about').textContent = format.dataset.about;
            };
            // the address keeps the format, so a link to the page can carry one, and so can the way
            // back from a demo
            const follow = () => {
                const linked = formats.find((input) => input.value === location.hash.slice(1));
                if (linked) linked.checked = true;
                choose();
            };
            for (const input of formats) {
                input.addEventListener('change', () => {
                    history.replaceState(null, '', '#' + input.value);
                    choose();
                });
            }
            addEventListener('hashchange', follow);
            document.querySelector('.format').hidden = false;
            follow();

            // a page that isn't allowed the clipboard gets no buttons, and a click on a command
            // still selects all of it
            if (navigator.clipboard) {
                for (const button of document.querySelectorAll('.command button')) {
                    const code = button.previousElementSibling;
                    button.hidden = false;
                    button.addEventListener('click', async () => {
                        try {
                            await navigator.clipboard.writeText(code.textContent);
                        } catch {
                            // refused, so leave the command selected for the user to copy
                            getSelection().selectAllChildren(code);
                            return;
                        }
                        button.classList.add('copied');
                        button.setAttribute('aria-label', 'Copied');
                        setTimeout(() => {
                            button.classList.remove('copied');
                            button.setAttribute('aria-label', 'Copy the command');
                        }, 2000);
                    });
                }
            }
        </script>
    </body>
</html>
`;

fs.writeFileSync(path.join(site, 'index.html'), page);
console.log(`Wrote ${FORMATS.length * STARTERS.length} builds and the gallery to ${site}`);

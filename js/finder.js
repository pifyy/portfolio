// The finder: keywords drift right → left along the search line. When one slides
// into the search box it gets "typed", the spinner turns, and the wall of
// paintings flips over to that keyword's set.
//
// To change the keywords or art: edit CHANNELS. Each channel needs 8 pieces;
// images live in img/art/<slug>.webp.

const CHANNELS = [
  {
    keyword: "shipwrecks & despair",
    art: [
      ["raft-of-the-medusa", "The Raft of the Medusa — Géricault, 1819"],
      ["ninth-wave", "The Ninth Wave — Aivazovsky, 1850"],
      ["sea-of-ice", "The Sea of Ice — Friedrich, 1824"],
      ["slave-ship", "The Slave Ship — Turner, 1840"],
      ["barque-of-dante", "The Barque of Dante — Delacroix, 1822"],
      ["gulf-stream", "The Gulf Stream — Homer, 1899"],
      ["storm-on-galilee", "The Storm on the Sea of Galilee — Rembrandt, 1633"],
      ["fighting-temeraire", "The Fighting Temeraire — Turner, 1839"],
    ],
  },
  {
    keyword: "visions of hell",
    art: [
      ["garden-of-earthly-delights", "The Garden of Earthly Delights — Bosch, c. 1500"],
      ["triumph-of-death", "The Triumph of Death — Bruegel, c. 1562"],
      ["the-nightmare", "The Nightmare — Fuseli, 1781"],
      ["saturn", "Saturn Devouring His Son — Goya, c. 1820"],
      ["pandemonium", "Pandemonium — John Martin, 1841"],
      ["fall-of-rebel-angels", "The Fall of the Rebel Angels — Bruegel, 1562"],
      ["last-judgment", "The Last Judgment — Michelangelo, 1541"],
      ["dulle-griet", "Dulle Griet — Bruegel, 1563"],
    ],
  },
  {
    keyword: "the sublime",
    art: [
      ["wanderer", "Wanderer above the Sea of Fog — Friedrich, 1818"],
      ["the-oxbow", "The Oxbow — Thomas Cole, 1836"],
      ["sierra-nevada", "Among the Sierra Nevada — Bierstadt, 1868"],
      ["monk-by-the-sea", "The Monk by the Sea — Friedrich, 1810"],
      ["landers-peak", "The Rocky Mountains, Lander's Peak — Bierstadt, 1863"],
      ["the-bard", "The Bard — John Martin, 1817"],
      ["rain-steam-speed", "Rain, Steam and Speed — Turner, 1844"],
      ["heart-of-the-andes", "The Heart of the Andes — Church, 1859"],
    ],
  },
  {
    keyword: "old engravings",
    art: [
      ["melencolia", "Melencolia I — Dürer, 1514"],
      ["knight-death-devil", "Knight, Death and the Devil — Dürer, 1513"],
      ["rhinoceros", "The Rhinoceros — Dürer, 1515"],
      ["the-raven", "The Raven — Doré, 1884"],
      ["destruction-of-leviathan", "The Destruction of Leviathan — Doré, 1865"],
      ["satans-despair", "Satan's Despair — Doré, 1866"],
      ["flammarion", "The Flammarion Engraving, 1888"],
      ["paradise-lost-12", "Paradise Lost, Book I — Doré, 1866"],
    ],
  },
  {
    keyword: "ruins of empire",
    art: [
      ["desolation", "The Course of Empire: Desolation — Cole, 1836"],
      ["destruction", "The Course of Empire: Destruction — Cole, 1836"],
      ["consummation", "The Course of Empire: Consummation — Cole, 1836"],
      ["savage-state", "The Course of Empire: The Savage State — Cole, 1834"],
      ["abbey-in-the-oakwood", "The Abbey in the Oakwood — Friedrich, 1810"],
      ["isle-of-the-dead", "Isle of the Dead — Böcklin, 1883"],
      ["louvre-in-ruins", "The Grande Galerie in Ruins — Hubert Robert, 1796"],
      ["expulsion", "Expulsion from the Garden of Eden — Cole, 1828"],
    ],
  },
];

const CARD_COUNT = 8;
const src = (slug) => `img/art/${slug}.webp`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const finder = document.querySelector(".finder");
const grid = finder.querySelector(".finder__grid");
const ticker = finder.querySelector(".finder__ticker");
const track = finder.querySelector(".finder__track");
const search = finder.querySelector(".finder__search");
const query = finder.querySelector(".finder__query");

/* ---------- Cards ---------- */
const cards = Array.from({ length: CARD_COUNT }, () => {
  const li = document.createElement("li");
  li.className = "finder__card";
  li.innerHTML = `
    <div class="finder__flip">
      <div class="finder__media"><img alt="" decoding="async"></div>
      <p class="finder__caption"></p>
    </div>`;
  grid.append(li);
  return {
    flip: li.querySelector(".finder__flip"),
    img: li.querySelector("img"),
    caption: li.querySelector(".finder__caption"),
  };
});

function paint(card, [slug, title]) {
  card.img.src = src(slug);
  card.img.alt = title;
  card.caption.textContent = title;
}

function preload(channel) {
  const loads = channel.art.map(([slug]) => {
    const img = new Image();
    img.src = src(slug);
    return img.decode().catch(() => {});
  });
  return Promise.race([Promise.all(loads), wait(2500)]);
}

// Flip every card over to the new set, rippling left → right, top → bottom.
function flipTo(channel) {
  if (reduceMotion) {
    cards.forEach((card, i) => paint(card, channel.art[i]));
    return Promise.resolve();
  }
  return Promise.all(
    cards.map(async (card, i) => {
      const delay = i * 70 + Math.random() * 60;
      const away = card.flip.animate(
        [{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }],
        { duration: 240, delay, easing: "cubic-bezier(.55,0,.75,.2)", fill: "forwards" }
      );
      await away.finished;
      paint(card, channel.art[i]);
      // No fill on the return: it ends at the card's natural state, so nothing
      // is left holding the element once it's done.
      const back = card.flip.animate(
        [{ transform: "rotateY(-90deg)" }, { transform: "rotateY(0deg)" }],
        { duration: 380, easing: "cubic-bezier(.2,.9,.3,1)" }
      );
      away.cancel();
      await back.finished;
    })
  );
}

async function type(text) {
  finder.classList.add("is-typing");
  query.textContent = "";
  for (const char of text) {
    query.textContent += char;
    await wait(reduceMotion ? 0 : 28);
  }
  finder.classList.remove("is-typing");
}

// A keyword has reached the box: type it, "search", then flip the wall.
let queue = Promise.resolve();
function arrive(index) {
  const channel = CHANNELS[index];
  queue = queue.then(async () => {
    finder.classList.add("is-loading");
    const loaded = preload(channel);
    await type(channel.keyword);
    await Promise.all([loaded, wait(500)]);
    await flipTo(channel);
    finder.classList.remove("is-loading");
  });
}

/* ---------- Ticker ---------- */
// Words are absolutely positioned at fixed offsets inside the track when they're
// created; each frame only moves the track. No layout is read per frame.
let x = 0;               // track offset in px (grows more negative)
let nextIndex = 0;       // which keyword to append next
let nextLeft = 0;        // where the next word goes, in track coordinates
let boxRight = 0;        // right edge of the search box, in ticker coordinates
let viewWidth = 0;       // ticker width
let gap = 0;             // space between words
let speed = 80;          // px per second
const words = [];        // { el, left, width, index, arrived }

function measure() {
  const t = ticker.getBoundingClientRect();
  const s = search.getBoundingClientRect();
  boxRight = s.right - t.left;
  viewWidth = t.width;
  gap = parseFloat(getComputedStyle(track).columnGap) || 64;
  speed = Math.min(110, Math.max(60, viewWidth * 0.055));
}

function appendWord() {
  const el = document.createElement("span");
  el.className = "finder__word";
  el.textContent = CHANNELS[nextIndex].keyword;
  el.style.left = `${nextLeft}px`;
  track.append(el);
  const width = el.offsetWidth; // one read per new word, not per frame
  words.push({ el, left: nextLeft, width, index: nextIndex, arrived: false });
  nextLeft += width + gap;
  nextIndex = (nextIndex + 1) % CHANNELS.length;
}

function step(initial = false) {
  // Keep the right side stocked, drop words that have left on the left.
  while (x + nextLeft < viewWidth + 300) appendWord();
  while (words.length && x + words[0].left + words[0].width < -50) words.shift().el.remove();

  // Words to the left of the box's right edge have been "searched".
  let latest = null;
  for (const w of words) {
    if (w.arrived || x + w.left > boxRight - 12) continue;
    w.arrived = true;
    latest = w.index;
    if (!initial) arrive(latest);
  }
  track.style.transform = `translate3d(${x}px, -50%, 0)`;
  return latest;
}

function start() {
  measure();
  // Begin with a few words already past the box so both sides feel populated.
  x = -viewWidth * 0.12;
  const current = step(true) ?? 0;
  cards.forEach((card, i) => paint(card, CHANNELS[current].art[i]));
  query.textContent = CHANNELS[current].keyword;

  if (reduceMotion) {
    // No drifting: just step through the keywords.
    ticker.hidden = true;
    let i = current;
    setInterval(() => { i = (i + 1) % CHANNELS.length; arrive(i); }, 5000);
    return;
  }

  // The loop only runs while the finder is on screen (and the browser already
  // pauses requestAnimationFrame in background tabs).
  let raf = 0;
  let last = 0;
  function frame(now) {
    const dt = last ? Math.min(now - last, 64) / 1000 : 0;
    last = now;
    x -= speed * dt;
    step();
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(finder);
}

// Re-measure on resize (debounced); existing words keep their spacing.
let resizeTimer;
addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 150); });
// Start once the ticker's own font is in (word widths depend on it); no need to
// wait for the serif fonts the rest of the page uses.
document.fonts.load('1em "Archivo"').then(start, start);

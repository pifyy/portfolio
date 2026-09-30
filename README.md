# Pierce (from online)

One page, in order:

1. **The finder:** keywords drift right → left into a search box. Each keyword
   that arrives is typed in, the spinner turns, and the wall of paintings flips
   over to that keyword's set.
2. **The title plate:** Vermeer's *Girl with a Pearl Earring* mounted on board,
   with "Beauty Didn't Die, You Stopped Looking" set across it.
3. **The essay:** five numbered chapters on canvas, a two-column "cause & consequence" section, and full-bleed,
   close-cropped paintings (thick brushwork) with a line set over each. The
   last chapter sits on Van Gogh's *Wheat Field with Cypresses*.

No framework, no build step. Open `index.html` in a browser.

## Files

```
index.html      The page
css/style.css   Finder, title plate + essay styles
js/finder.js    Keywords, artwork list, ticker & flip logic
img/art/        40 public-domain paintings & engravings (560px WebP)
img/texture/    3 high-res paintings for the essay's full-bleed sections (1800px WebP)
fonts/          Self-hosted Archivo, EB Garamond + Instrument Serif (latin subsets)
```

## Changing keywords or art

Edit `CHANNELS` at the top of `js/finder.js`. Each channel is a keyword plus
8 pieces of art as `[slug, caption]`; the image lives at `img/art/<slug>.webp`.

## Art credits

Everything is public domain, via Wikimedia Commons: Géricault, Aivazovsky,
Friedrich, Turner, Delacroix, Winslow Homer, Rembrandt, Bosch, Bruegel, Fuseli,
Goya, John Martin, Michelangelo, Thomas Cole, Bierstadt, Frederic Church,
Dürer, Doré, Flammarion, Böcklin, Hubert Robert, Vermeer, Van Gogh and Monet.

## Changing a painting section

Each `<figure class="texture">` in `index.html` sets three inline variables:
`--focus` (which part of the painting to centre on), `--zoom` (how close in,
so the brushwork shows) and `--veil` (how much to darken it behind the words).

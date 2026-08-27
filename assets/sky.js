/* A pixel-art sky above the header, tracking the reader's own time of day.
 *
 * The bitmap really is low-resolution — a few hundred pixels across — and the
 * browser scales it up with nearest-neighbor sampling (`image-rendering` in
 * style.css). The pixels are pixels, not a grid drawn over a smooth image.
 * Nothing blends: an ordered dither decides per pixel whether the ink lands,
 * which is how one color gets a gradient.
 *
 * Nothing is there on load, either. The trees and buildings sprout one at a
 * time on an overshooting ease, at a cadence that starts slow and accelerates,
 * into spots chosen by rejection sampling. The sequence is the part that reads
 * as authored rather than generated.
 *
 * Only the ink is painted; every other pixel is left transparent for the page
 * to show through. That keeps one color rather than two, and means a redraw
 * this script fails to notice leaves stale art rather than an opaque slab of
 * the wrong background over a page that has since changed color. The ink
 * itself is read back out of the canvas's own computed style rather than
 * restated here, so the season and `light-dark()` stay owned by the
 * stylesheet.
 *
 * The element is created here rather than sitting in the markup: without JS
 * there is no canvas to leave a blank band where the art would have been.
 */
(() => {
  /* Art-pixel height of the band, and how many CSS pixels each art pixel
     covers. Width follows the element, so these two fix the whole geometry. */
  const HEIGHT = 78;
  const SCALE = 2;

  /* Ink density at the top of the band, at night and at midday.
   *
   * One ink on a bare page means density reads as *darkness* in light mode and
   * as *brightness* in dark mode — the same pixels, opposite meanings. So the
   * two schemes want opposite curves: a light-mode night sky is heavy with
   * ink, a dark-mode night sky is nearly bare and lets the stars carry it.
   * Getting this backwards is what makes a one-color scene look inverted. */
  const SKY_INK = {
    light: { night: 0.46, day: 0.28 },
    /* Dark night runs much thinner than its light-mode counterpart on purpose.
       There, stars are holes punched in a dense sky and read against it; here
       they're the same ink as the sky texture, so any real density buries them
       in noise and the twinkle goes with it. Sparse, the stars carry the band
       on their own — which is what a night sky looks like anyway. */
    dark: { night: 0.11, day: 0.5 },
  };

  /* How far the per-pixel noise below may push a threshold. Enough to break
     the dither's tiling, small enough to leave the gradient smooth. */
  const JITTER = 0.2;

  /* Rows over which the ink fades back in at the very top. Without it the
     densest row butts straight against the top of the page and the band reads
     as a texture that got cut off rather than one that ends. */
  const FADE_ROWS = 11;

  /* How long one sprite takes to rise, and how far past its resting height it
     overshoots before settling, as a fraction of the sprite. */
  const RISE_MS = 620;
  const OVERSHOOT = 0.7;

  /* Winter thins the sky right down, and this is the whole reason the snow
     reads at all. Falling flakes drawn onto a full stipple are invisible —
     same mark, same ink, same size as the dither behind them, and no amount of
     making the flake bigger fixes that. Emptying the sky instead lets the snow
     be the only texture up there, so the eye reads texture-that-moves as
     weather. A washed-out winter sky is truer anyway. */
  const SEASON_SKY = { winter: 0.38, autumn: 0.65 };

  /* Weather, by season. Counts scale with width so a wide band isn't sparser
     than a narrow one; periods are seconds for one particle to cross. */
  const SNOW_PER_PX = 0.21;
  const SNOW_FALL = 44;
  const LEAF_PER_PX = 0.057;
  const LEAF_FALL = 26;
  const FIREFLY_PER_PX = 0.15;
  const GEESE_PERIOD = 208;

  /* Chimney smoke: how many puffs are in the air at once, how long each takes
     to run the plume, and how far it rises and leans while it does. */
  const SMOKE_PUFFS = 7;
  const SMOKE_PERIOD = 12.8;
  const SMOKE_RISE = 20;
  const SMOKE_DRIFT = 8;

  /* The ambient loop's frame time. Deliberately coarse: at eight frames a
     second a twinkle reads as a twinkle, and the scene is 10k pixels, so the
     whole thing costs less than the smooth version would waste. */
  const AMBIENT_MS = 125;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.className = "sky";
  canvas.setAttribute("role", "img");
  /* A baseline name, replaced on the first paint by one that describes the
     scene actually drawn. Set here rather than left to that first paint
     because role="img" with no accessible name is worse than no role at all —
     a screen reader announces an image and then has nothing to say about it,
     and that is exactly the state the canvas would sit in for the frame
     before the first paint, or permanently if a paint ever failed. */
  canvas.setAttribute("aria-label", "Pixel-art Ipswich ridgeline.");

  const schemeQuery = matchMedia("(prefers-color-scheme: dark)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let dark = schemeQuery.matches;

  /* ------------------------------------------------------------------ *
   * Dithering
   * ------------------------------------------------------------------ */

  /* The recursive Bayer threshold map, the ordered-dither classic. Each level
     quadruples the previous one's values and offsets the four quadrants by
     0, 2, 3, 1 — the ordering that puts consecutive thresholds as far apart as
     possible, so a flat tone comes out as an even stipple rather than clumps
     or diagonal banding. */
  const bayer = (n) => {
    if (n === 1) return [[0]];
    const half = n / 2;
    const prev = bayer(half);
    const out = [];
    for (let y = 0; y < n; y++) {
      out.push([]);
      for (let x = 0; x < n; x++) {
        const quadrant = y < half ? (x < half ? 0 : 2) : x < half ? 3 : 1;
        out[y][x] = prev[y % half][x % half] * 4 + quadrant;
      }
    }
    return out;
  };
  const BAYER = bayer(8);

  /* Deterministic per-coordinate noise. The Bayer matrix repeats every 8
     pixels and the eye finds that grid across a large flat area; nudging each
     threshold by a fixed amount hides the repeat without softening any edge.
     Being a pure function of the coordinates, it also means the stars below
     land in the same places on every redraw without storing a seed. */
  const noise = (x, y) => {
    let h = (x * 374761393 + y * 668265263) ^ 0x5f356495;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  const threshold = (x, y) => {
    const ordered = (BAYER[y & 7][x & 7] + 0.5) / 64;
    const jittered = ordered + (noise(x, y) - 0.5) * JITTER;
    return Math.min(0.99, Math.max(0.01, jittered));
  };

  /* ------------------------------------------------------------------ *
   * The clock
   * ------------------------------------------------------------------ */

  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const smoothstep = (t) => {
    const c = clamp01(t);
    return c * c * (3 - 2 * c);
  };

  /* Hours of daylight on this date at roughly 42°N — Ipswich's latitude, held
     fixed, because the reader's clock tells us their time but not where they
     are. The 3.1-hour swing is what that latitude gives: about 15h 15m at the
     June solstice down to 9h 05m at the December one. It lands sunrise within
     half an hour or so across the northern temperate zone, and the error only
     ever shifts the sun a pixel along its arc.

     Assumes the northern hemisphere. A southern reader gets the seasons
     backwards, which no amount of arithmetic fixes without knowing where they
     are — and asking for that, to place a nine-pixel sun, is not a trade worth
     making. */
  function daylightHours(date) {
    const yearStart = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date - yearStart) / 86400000);
    return 12 + 3.1 * Math.sin((2 * Math.PI * (dayOfYear - 80)) / 365.25);
  }

  /* Hours the reader's clock is currently shifted for daylight saving. The sun
     keeps solar time; wall clocks don't, and an uncorrected model puts sunrise
     an hour early for two thirds of the year in every observing zone. Compared
     against whichever of January and July sits further from UTC, so it comes
     out zero wherever DST isn't observed and in the southern hemisphere's
     opposite season alike. */
  function savingsShift(date) {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return (Math.max(jan, jul) - date.getTimezoneOffset()) / 60;
  }

  /* Days since the new moon of 2000-01-06, over the synodic month. Accurate to
     a few hours for centuries either side, which is far inside the resolution
     of a nine-pixel moon. */
  const SYNODIC = 29.530588853;
  const moonPhase = (date) => {
    const days = (date - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
  };

  /* Where we are between sunrise and sunset, and how far along whichever arc
     the sun or moon is currently walking. */
  function skyClock(date) {
    const hours = date.getHours() + date.getMinutes() / 60;
    const half = daylightHours(date) / 2;
    const noon = 12 + savingsShift(date);
    const sunrise = noon - half;
    const sunset = noon + half;
    const TWILIGHT = 1.1;

    /* Ramps up across dawn and back down across dusk, so the sky changes over
       a couple of hours rather than snapping at the horizon. */
    const daylight = Math.min(
      smoothstep((hours - sunrise + TWILIGHT) / (2 * TWILIGHT)),
      smoothstep((sunset + TWILIGHT - hours) / (2 * TWILIGHT)),
    );


    const isDay = hours > sunrise && hours < sunset;
    const dayLength = sunset - sunrise;
    const arc = isDay
      ? (hours - sunrise) / dayLength
      : /* Night runs from sunset to the next sunrise, so it wraps midnight. */
        (hours > sunset ? hours - sunset : hours + 24 - sunset) /
        (24 - dayLength);

    return { daylight, isDay, arc: clamp01(arc) };
  }

  /* ------------------------------------------------------------------ *
   * Terrain and sprites
   * ------------------------------------------------------------------ */

  /* Two sine waves at frequencies with no common period, so the ridge doesn't
     visibly repeat across any width the band is asked to fill. */
  const ridgeAt = (x) =>
    Math.round(
      HEIGHT * 0.8 + 6 * Math.sin(x * 0.014 + 2) + 3.75 * Math.sin(x * 0.038),
    );

  /* Sprite art. `#` is ink, `o` is punched clear, and anything else is left
     alone for the sky to show through. The distinction matters: a `.` window
     would fill with sky dither on a dense night and vanish, so any opening
     that has to read as an opening is an `o`.

     Each sprite stands on the ridge, so its last row is the one that touches
     the ground. */

  /* Home. Blue shingles and a red door don't survive a single ink; what does
     is the massing, and the massing is asymmetric: a low left wing carrying
     the roof deck (those two pixels on row 6 are its railing), then the steep
     cross-gable left of center with its paired windows, then the long main
     block under its flue, then the porch roof stepping down again at the right
     end. Read left to right, that stagger is the whole likeness — a symmetric
     house with a centered gable is every other house on the ridge. */
  const HOME = {
    name: "home",
    /* Sprite cell the chimney smoke rises from, as [col, row]. Any sprite can
       carry one; this is the only one that does, and that's the point — it's
       the only moving thing on the ridge, which is how you pick your own house
       out of a row of pixel-art houses that otherwise all look alike. */
    smoke: [21, 2],
    /* The butternut in the yard. Carried by the house rather than thrown in
       with the woods, because it has to stand beside it — a tree that size is
       part of the house, not scenery that happened to land nearby.

       The form is a vase, not a lollipop: a short thick trunk that forks low
       into a few massive limbs splaying outward, carrying a crown far wider
       than the tree is tall above the fork. That silhouette is the whole
       likeness — a straight bole under a round blob would read as a generic
       shade tree and look nothing like it. The punched gaps matter for the
       same reason: butternuts are open enough to see sky through, and the bare
       limbs show right through the canopy. Solid foliage would read as a
       maple.

       Foliage hangs at the branch ends and nowhere else, because butternut
       leaves are crowded at the tips and whorled, and the limbs stay visible
       in the gaps between the tufts -- that see-through, dappled crown is what
       the species is known for. Every tip lands on a rounded envelope, narrow
       at the top and widest about two thirds up. Fill the gaps in or size the
       tufts up until they merge, and it stops being a butternut and becomes a
       lollipop.

       In winter it stands in leaf-off instead: the same envelope drawn as
       bones, because that is genuinely what the yard looks like for a third of
       the year, and because a broadleaf tree in full leaf beside falling snow
       is the kind of wrong that nags. Which one gets placed is decided once,
       from the season, since the season can't change while the page is open. */
    beside: {
      bare: [
        "................#...............",
        "...........#....#....#..........",
        "#..........#...#.....#.........#",
        "##.#......#.#..#....##......#.##",
        ".#.##.....#.#..#....##.....##.#.",
        ".##.#....#...#.#...#..#....#.##.",
        "..#..#...#...####.##..#...#..#..",
        "...#.#...#....#####...#...#.#...",
        "...####.#......###.....#.####...",
        "....###.#......###.....#.###....",
        ".....##.#......###.....#.##.....",
        "......##.......###......##......",
        "......###......###.....###......",
        ".....#.###.....###....###.#.....",
        "......#####....###...#####......",
        ".......#####...###..#####.......",
        "........####..###...####........",
        "..........###.###..###..........",
        "...........######.###...........",
        "...........##########...........",
        "............########............",
        ".............######.............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        ".............######.............",
        ".............######.............",
        "............########............",
        "............########............",
        "...........##########...........",
      ],
      art: [
        "..............#####.............",
        ".............#######.#..........",
        ".........#####.####.###.........",
        "......#.#######.#.#######.#.....",
        "....##########..#..####.#####...",
        "...#######.#...###...#.########.",
        "####.#####.#.#######.#..########",
        "##################.##.##########",
        ".####.######.##.#.##.######.####",
        "..#.#..#####..#####..#####.#....",
        "....##..##...#######...#..##....",
        "...######.....#####.....#####...",
        "...######......###......#######.",
        "...######......###.....#######..",
        ".......###.....###....###..#....",
        "......#####....###...#####......",
        ".......#####..####..#####.......",
        ".........####.###..####.........",
        "..........#######.####..........",
        "...........##########...........",
        "............########............",
        ".............######.............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        "..............####..............",
        ".............######.............",
        ".............######.............",
        "............########............",
        "............########............",
        "...........##########...........",
      ],
    },
    art: [
      ".........#................",
      "........###...............",
      ".......#####.........#....",
      "......##oo###........#....",
      ".....###oo####.########...",
      "#.#.###################...",
      "...#####################..",
      "##########################",
      ".################oo#oo###.",
      ".#oo#############oo#oo###.",
      ".#oo#####################.",
      ".####oo####oo####oo#oo###.",
      ".####oo####oo####oo#oo###.",
      ".##########oo############.",
      "##########################",
    ],
  };

  /* Two of these show at a time, drawn fresh on every load. */
  const LANDMARKS = [
    {
      /* 1935, and the whole point of it is the shape: a giant fried-clam
         carton, flaring wider toward the top with its flaps propped open. It
         may be the single most pixel-art-shaped building in New England. */
      name: "the Clam Box",
      art: [
        "##...............##",
        "###.............###",
        "###################",
        "###################",
        "###################",
        ".#################.",
        ".#################.",
        "..###############..",
        "..###############..",
        "..###############..",
        "...####ooooo####...",
        "...####ooooo####...",
        "...#############...",
        "...#############...",
        "...#############...",
      ],
    },
    {
      /* The Great House at Castle Hill, 1928. Long, low and grand, and what
         you actually remember is the row of tall chimneys along the roof. */
      name: "the Great House at Castle Hill",
      art: [
        "....##.....##.....##.....",
        "....##.....##.....##.....",
        "....##.....##.....##.....",
        "....##.....##.....##.....",
        ".#######################.",
        "#########################",
        "#########################",
        "#########################",
        "##o##o##o##o##o##o##o#o##",
        "#########################",
        "#########################",
        "#########################",
        "##o##o##o##o##o##o##o#o##",
        "#########################",
        "#########################",
        "#########################",
      ],
    },
    {
      /* 1764, and the oldest documented two-span stone arch bridge in the
         country. The arches are punched through to the ground on purpose:
         it's a bridge, so the ridge should show daylight under it. */
      name: "the Choate Bridge",
      /* Rows that sit *below* the ridge line instead of on it. A bridge is the
         one structure here that isn't built on the ground — the roadway runs
         level with the banks and the arches drop away underneath, so anchoring
         it like a house left it perched on the hilltop with its arches in the
         air. */
      sink: 8,
      art: [
        "######################",
        "######################",
        "######################",
        "#####ooo######ooo#####",
        "####ooooo####ooooo####",
        "###ooooooo##ooooooo###",
        "###ooooooo##ooooooo###",
        "###ooooooo##ooooooo###",
        "###ooooooo##ooooooo###",
        "###ooooooo##ooooooo###",
        "###ooooooo##ooooooo###",
      ],
    },
    {
      /* The one silhouette here that's all vertical, which is why it's worth
         including — it breaks up a ridge of otherwise wide, low buildings. */
      name: "the First Church steeple",
      art: [
        ".......##.......",
        ".......##.......",
        ".......##.......",
        "......####......",
        "......####......",
        ".....######.....",
        ".....#o##o#.....",
        ".....######.....",
        "....########....",
        "....########....",
        "....###oo###....",
        "....########....",
        "...##########...",
        "..############..",
        ".##############.",
        "################",
        "################",
        "##o##o####o##o##",
        "#######oo#######",
        "#######oo#######",
        "################",
      ],
    },
    {
      /* c. 1677, First Period, and the massive central chimney is the tell —
         it sits right at the ridge rather than at a gable end. */
      name: "the Whipple House",
      art: [
        ".......#####.......",
        ".......#####.......",
        ".......#####.......",
        ".....#########.....",
        "....###########....",
        "...#############...",
        "..###############..",
        ".#################.",
        "..###############..",
        "..##o##o###o##o##..",
        "..###############..",
        "..###############..",
        "..##o###ooo###o##..",
        "..######ooo######..",
        "..###############..",
      ],
    },
    {
      /* 1638, and the oldest continuously operating farm in the country. The
         gambrel is the tell: two slopes a side, shallow over steep, which is a
         roofline nothing else on this ridge has. */
      name: "the Appleton Farms barn",
      art: [
        "...........###..........",
        "...........###..........",
        "..........#####.........",
        "........#########.......",
        "......#####oo######.....",
        "....#######oo########...",
        "...###################..",
        "..#####################.",
        ".#######################",
        "########################",
        ".######################.",
        ".##oo#####oooo#####oo##.",
        ".##oo#####oooo#####oo##.",
        ".#########oooo#########.",
        ".######################.",
        "########################",
      ],
    },
    {
      /* The flats are why anyone outside Essex County has heard of the town.
         Hull only, high at both ends and hollow in the middle — a dory drawn
         solid reads as a leaf. */
      name: "a clam dory",
      art: [
        "#............#",
        "##..........##",
        "###........###",
        "###oooooooo###",
        ".###oooooo###.",
        "..##########..",
        "....######....",
      ],
    },
    {
      /* The mill on the river, and the only vertical here that isn't a
         steeple. The punched ring four rows down is the clock. */
      name: "the Ipswich Mills clock tower",
      art: [
        ".......######.......",
        "......########......",
        ".......######.......",
        ".......######.......",
        ".......#oooo#.......",
        ".......#o##o#.......",
        ".......#oooo#.......",
        ".......######.......",
        ".......######.......",
        "......########......",
        "####################",
        "####################",
        "##oo#oo#######oo#oo#",
        "##oo#oo#######oo#oo#",
        "####################",
        "####################",
        "##oo#oo#######oo#oo#",
        "##oo#oo##oo###oo#oo#",
        "#########oo#########",
        "####################",
      ],
    },
    {
      /* Slate headstones, seventeenth century, in four heights. The staggered
         tops are the whole silhouette: level them and it's a fence. */
      name: "the Old North Burying Ground",
      art: [
        ".......##.............",
        "......####............",
        "......####.........##.",
        ".##...####........####",
        "####..####...##...####",
        "####..####..####..####",
        "####..####..####..####",
        "####..####..####..####",
        "####..####..####..####",
      ],
    },
  ];

  /* How many landmarks join home on the ridge each time. */
  const LANDMARKS_SHOWN = 3;

  /* The woods that fill in around them. */
  const NATURE = [
    // tall pine
    [
      "......#......",
      ".....###.....",
      "....#####....",
      ".....###.....",
      "....#####....",
      "...#######...",
      "....#####....",
      "...#######...",
      "..#########..",
      "...#######...",
      "..#########..",
      ".###########.",
      ".....###.....",
      ".....###.....",
      ".....###.....",
    ],
    // short pine
    [
      "...#...",
      "..###..",
      "...#...",
      "..###..",
      ".#####.",
      "..###..",
      "#######",
      "...#...",
      "...#...",
      "...#...",
    ],
    // round-crowned tree
    [
      "...####...",
      "..######..",
      ".########.",
      "##########",
      "##########",
      ".########.",
      "..######..",
      "....##....",
      "....##....",
      "....##....",
    ],
  ].map((art) => ({ name: null, art }));

  /* Roughly how many trees per 100 art pixels of width, so a wide window gets
     a fuller valley rather than the same handful spread thin. Buildings claim
     their ground first, so this is an upper bound, not a count. */
  const SPRITES_PER_100PX = 3;

  /* Clouds are unions of discs, drifting at their own speeds. Offsets are
     fractions of the width so they spread out however wide the band gets. */
  const CLOUDS = [
    { offset: 0.1, y: 17, speed: 1.1, discs: [[0, 0, 6], [9, -3, 8], [20, 0, 6]] },
    { offset: 0.52, y: 30, speed: 0.7, discs: [[0, 0, 5], [8, -3, 6], [15, 0, 5]] },
    { offset: 0.78, y: 12, speed: 1.45, discs: [[0, 0, 5], [8, -2, 6], [14, 2, 5]] },
  ];

  /* easeOutBack: overshoots past 1 near the end, then settles. A hand-tuned
     cubic-bezier gives the same gesture but needs a solver to evaluate; this
     is its closed form. */
  const BACK = 1.70158;
  const easeOutBack = (t) =>
    1 + (BACK + 1) * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2);

  const randomInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

  /* Lays out one whole scene: what stands where, and when each thing arrives. */
  function place(width) {
    const placed = [];
    /* A gap wider than the sprites themselves; two pines touching read as one
       lumpy blob at this size, and a tree against a building reads as an
       extension of it. */
    const GAP = 6;

    const clearAt = (x, w) =>
      placed.every((p) => x + w + GAP <= p.x || x >= p.x + p.width + GAP);

    /* Rejection sampling: pick a spot, reject it if it crowds something
       already placed, try again. Capped rather than looped until success:
       once the ridge is full no valid spot exists, and an uncapped retry spins
       forever rather than giving up. */
    const tryPlace = (sprite, attempts) => {
      const w = sprite.art[0].length;
      if (w > width) return null;
      const sink = sprite.sink ?? 0;
      for (let i = 0; i < attempts; i++) {
        const x = randomInt(0, width - w);
        if (!clearAt(x, w)) continue;
        if (sink) {
          /* Only where the bank is high enough to hold a channel and the water
             in it — on a low stretch of ridge the river would run off the
             bottom of the band. */
          let deepest = 0;
          for (let c = 0; c < w; c++) deepest = Math.max(deepest, ridge[x + c] ?? 0);
          if (deepest + sink + 2 >= HEIGHT) continue;
        }
        const item = {
          art: sprite.art,
          name: sprite.name,
          smoke: sprite.smoke,
          sink,
          x,
          width: w,
          delay: 0,
        };
        placed.push(item);
        return item;
      }
      return null;
    };

    /* Home and its butternut are placed as a single unit, on whichever side
       the coin lands, so the tree is always in the yard rather than wherever
       the woods happened to scatter one. */
    const placeHome = (attempts) => {
      const houseW = HOME.art[0].length;
      const treeArt = season === "winter" ? HOME.beside.bare : HOME.beside.art;
      const treeW = treeArt[0].length;
      const YARD = 2;
      const span = houseW + YARD + treeW;
      if (span > width) return tryPlace(HOME, attempts);
      for (let i = 0; i < attempts; i++) {
        const x = randomInt(0, width - span);
        if (!clearAt(x, span)) continue;
        const treeLeft = Math.random() < 0.5;
        const house = {
          art: HOME.art,
          name: HOME.name,
          smoke: HOME.smoke,
          x: treeLeft ? x + treeW + YARD : x,
          width: houseW,
          delay: 0,
        };
        const tree = {
          art: treeArt,
          name: null,
          x: treeLeft ? x : x + houseW + YARD,
          width: treeW,
          delay: 0,
        };
        placed.push(tree, house);
        return { house, tree };
      }
      return null;
    };

    /* Buildings go down first and get more attempts: they're the widest things
       here, and once the trees are scattered there's no room left to fit one.
       Home is placed first of all — it's the one that always has to appear. */
    const homePair = placeHome(60);
    const home = homePair ? homePair.house : null;
    const pool = LANDMARKS.slice();
    const featured = [];
    /* Keep drawing until the ridge has its two, rather than once per slot: the
       bridge can decline a spot for want of a deep enough bank, and a refusal
       shouldn't cost the scene a landmark. */
    while (featured.length < LANDMARKS_SHOWN && pool.length) {
      const pick = pool.splice(randomInt(0, pool.length - 1), 1)[0];
      const item = tryPlace(pick, 60);
      if (item) featured.push(item);
    }

    const trees = [];
    const wanted = Math.round((width / 100) * SPRITES_PER_100PX);
    for (let i = 0; i < wanted; i++) {
      const item = tryPlace(NATURE[randomInt(0, NATURE.length - 1)], 24);
      if (item) trees.push(item);
    }

    /* Order of arrival is the opposite of order of placement: the woods fill
       in first and fastest, the landmarks arrive after a held beat, and home
       lands last. Smallest to largest: ending on the biggest thing makes the
       sequence read as a reveal rather than as a list. */
    let delay = 220;
    trees.forEach((item, i) => {
      item.delay = delay;
      /* Wide spacing for the first few so each one registers, then closing to
         a fast patter, with one held beat after the fifth. An even cadence
         reads as a loop running; an uneven one reads as a hand placing them. */
      delay += i < 4 ? 200 : Math.max(130 - i * 7, 45);
      if (i === 4) delay += 380;
    });
    delay += 420;
    for (const item of featured) {
      item.delay = delay;
      delay += 360;
    }
    /* The butternut goes up just before the house it shelters, so the pair
       reads as one beat rather than two unrelated ones. */
    if (homePair && homePair.tree) {
      homePair.tree.delay = delay;
      delay += 380;
    }
    if (home) home.delay = delay;

    return placed;
  }

  /* ------------------------------------------------------------------ *
   * Drawing
   * ------------------------------------------------------------------ */

  /* Canvas normalizes any CSS color to #rrggbb on the way back out, which
     saves parsing `rgb()` vs `color()` vs whatever a browser decides to
     serialize `light-dark()` into. */
  const channels = (value) => {
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    const hex = ctx.fillStyle;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  };

  let width = 0;
  let lastCssWidth = 0;
  let ridge = [];
  let sprites = [];
  let meteor = null;
  let nextMeteorAt = null;
  let inkColor = null;
  let bodyColor = null;
  let season = "";

  /* Cached, not read per frame: getComputedStyle forces a style recalculation,
     and the ambient loop would be asking for one eight times a second forever
     to be told the same answer. Only a scheme change or a resize can move it.

     `--season` is set by the same Hugo template that picks the accent color
     (see _partials/head.html), so the weather below and the ink it's drawn in
     always come from the same build. An unrecognized or missing value simply
     means no weather, which is the right way for this to fail. */
  const readTheme = () => {
    const style = getComputedStyle(canvas);
    inkColor = channels(style.color);
    bodyColor = channels(style.textDecorationColor);
    season = style.getPropertyValue("--season").trim();
  };

  function resize() {
    const cssWidth = canvas.clientWidth || document.documentElement.clientWidth;
    if (!cssWidth) return false;
    width = Math.max(64, Math.ceil(cssWidth / SCALE));
    canvas.width = width;
    canvas.height = HEIGHT;
    /* Height has to follow the width we actually rounded to, not the one we
       asked for, or the art pixels come out non-square and the scaled-up rows
       are visibly uneven. */
    canvas.style.height = Math.round((HEIGHT * cssWidth) / width) + "px";
    lastCssWidth = cssWidth;
    readTheme();
    ridge = [];
    for (let x = 0; x <= width; x++) ridge.push(ridgeAt(x));
    return true;
  }

  function describe(clock) {
    const when =
      clock.daylight > 0.75
        ? "daylight"
        : clock.daylight > 0.25
          ? "twilight"
          : "night";
    const body = clock.isDay ? "the sun" : "the moon";
    /* Only the buildings carry names; the trees are scenery. */
    const named = sprites.filter((s) => s.name).map((s) => s.name);
    const list =
      named.length > 1
        ? `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}`
        : named[0];
    const along = named.length ? ` Along the ridge: ${list}.` : "";
    /* Only the weather that's always running gets described. Fireflies and
       geese come and go, so naming them would be wrong half the time. */
    const falling =
      season === "winter" ? " Snow is falling." :
      season === "autumn" ? " Leaves are falling." : "";
    return `Pixel-art Ipswich ridgeline among small pines, under a dithered ${when} sky with ${body} above it.${falling}${along}`;
  }

  function draw(elapsed, seconds) {
    if (inkColor === null) readTheme();
    const ink = inkColor;
    const now = new Date();
    const clock = skyClock(now);
    const grid = new Uint8Array(width * HEIGHT);

    const inside = (x, y) => x >= 0 && x < width && y >= 0 && y < HEIGHT;
    const inSky = (x, y) => inside(x, y) && y < ridge[x] - 1;
    /* Solid ink, whatever the scheme: silhouettes and outlines. */
    const stroke = (x, y) => {
      if (inside(x, y)) grid[y * width + x] = 1;
    };
    /* Reads as *light* — a star, a lit disc, the inside of a cloud. Which
       pixel value that is depends on the scheme: ink where ink is the bright
       thing, bare page where the page is. */
    const glow = (x, y) => {
      if (inSky(x, y)) grid[y * width + x] = dark ? 1 : 0;
    };
    /* The sun or moon's face, and the only thing here drawn in the second
       color. Everything else on the band is ink or bare page. */
    const disc = (x, y) => {
      if (inSky(x, y)) grid[y * width + x] = 2;
    };
    /* Forced back to bare page — a window, a doorway, an arch. Distinct from
       simply not drawing: on a dense night sky an undrawn window fills with
       dither and the opening disappears. */
    const punch = (x, y) => {
      if (inside(x, y)) grid[y * width + x] = 0;
    };

    /* --- the sky itself --- */
    const range = dark ? SKY_INK.dark : SKY_INK.light;
    const density =
      (range.night + (range.day - range.night) * clock.daylight) *
      (SEASON_SKY[season] ?? 1);
    for (let x = 0; x < width; x++) {
      const crestTop = Math.min(ridge[x], ridge[x + 1]);
      for (let y = 0; y < crestTop; y++) {
        /* Ink thins toward the horizon, which is what makes the band read as
           sky rather than as texture. Squared, so the fade concentrates near
           the top instead of sloping evenly through the middle. */
        const height = (crestTop - y) / crestTop;
        const fade = Math.min(1, y / FADE_ROWS);
        if (density * height * height * fade > threshold(x, y)) stroke(x, y);
      }
    }

    /* --- stars, once it's dark enough for them --- */
    const starlight = 1 - smoothstep(clock.daylight * 1.6);
    if (starlight > 0.05) {
      const CELL = 16;
      for (let gy = 0; gy < HEIGHT; gy += CELL) {
        for (let gx = 0; gx < width; gx += CELL) {
          if (noise(gx, gy) > starlight * 0.8) continue;
          const x = gx + Math.floor(noise(gx + 1, gy) * CELL);
          const y = gy + Math.floor(noise(gx, gy + 1) * CELL);
          /* In summer the low strip over the ridge belongs to the fireflies.
             A firefly and a star are the same bright pixel, so height is the
             only thing distinguishing them — keeping stars out of that band is
             what lets the swarm read as a swarm and not as more sky. */
          if (season === "summer") {
            const xi = Math.max(0, Math.min(width - 1, x));
            if (y > ridge[xi] - 19) continue;
          }
          /* Half of them blink, each on its own offset in the cycle, so the
             field shimmers instead of pulsing in unison. */
          if (noise(gx + 3, gy + 3) < 0.5) {
            const beat = (seconds * 0.225 + noise(gx + 2, gy + 2)) % 1;
            if (beat < 0.24) continue;
          }
          glow(x, y);
          /* In light mode a star is a hole punched in a dense sky, and a
             single cleared pixel barely registers among that much ink. */
          if (!dark) glow(x + 1, y);
        }
      }
    }

    /* --- and every half minute or so, one of them falls --- */
    if (starlight > 0.5 && !reduced.matches) {
      if (nextMeteorAt === null) nextMeteorAt = seconds + 3 + Math.random() * 8;
      if (!meteor && seconds >= nextMeteorAt) {
        const fromLeft = Math.random() < 0.5;
        const speed = 41 + Math.random() * 30;
        meteor = {
          x0: fromLeft ? -18 : width + 18,
          y0: 4 + Math.random() * 18,
          vx: (fromLeft ? 1 : -1) * speed,
          vy: speed * (0.28 + Math.random() * 0.22),
          t0: seconds,
        };
      }
      if (meteor) {
        const age = seconds - meteor.t0;
        const hx = meteor.x0 + meteor.vx * age;
        const hy = meteor.y0 + meteor.vy * age;
        if (hx < -38 || hx > width + 38 || hy > HEIGHT) {
          meteor = null;
          /* Rare enough to be a surprise rather than a metronome. */
          nextMeteorAt = seconds + 20 + Math.random() * 28;
        } else {
          /* The trail is where the meteor was a beat ago, brightest at the
             head and dithering out toward the tail. */
          const TRAIL = 0.42;
          const tx = hx - meteor.vx * TRAIL;
          const ty = hy - meteor.vy * TRAIL;
          const steps = Math.max(1, Math.round(Math.hypot(hx - tx, hy - ty)));
          for (let i = 0; i <= steps; i++) {
            const f = i / steps;
            const x = Math.round(tx + (hx - tx) * f);
            const y = Math.round(ty + (hy - ty) * f);
            if (0.1 + 0.9 * f * f > threshold(x + 40, y + 40)) glow(x, y);
          }
          glow(Math.round(hx), Math.round(hy));
        }
      }
    }

    /* --- clouds, once it's light enough for them --- */
    if (clock.daylight > 0.35) {
      const span = width + 60;
      for (const cloud of CLOUDS) {
        const cx = ((cloud.offset * width + seconds * cloud.speed) % span) - 30;
        const inCloud = (x, y) =>
          cloud.discs.some(
            ([dx, dy, r]) => (x - dx) ** 2 + (y - dy) ** 2 <= r * r,
          );
        for (let y = -12; y <= 9; y++) {
          for (let x = -12; x <= 30; x++) {
            if (!inCloud(x, y)) continue;
            const edge =
              !inCloud(x - 1, y) ||
              !inCloud(x + 1, y) ||
              !inCloud(x, y - 1) ||
              !inCloud(x, y + 1);
            const px = Math.round(cx + x);
            const py = cloud.y + y;
            if (edge) {
              if (inSky(px, py)) stroke(px, py);
            } else {
              glow(px, py);
            }
          }
        }
      }
    }

    /* --- the sun or the moon, walking its arc --- */
    const R = 6;
    const bx = Math.round(width * (0.1 + 0.8 * clock.arc));
    const horizon = ridge[Math.min(width - 1, Math.max(0, bx))];
    const by = Math.round(
      horizon - 4 - Math.sin(Math.PI * clock.arc) * (horizon - 20),
    );
    /* A sun is lit all the way round; a moon is lit up to its terminator,
       which sweeps across the disc as the phase advances. */
    const phase = clock.isDay ? null : moonPhase(now);
    const k = phase === null ? 0 : Math.cos(2 * Math.PI * phase);
    const waxing = phase !== null && phase < 0.5;
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        if (x * x + y * y > R * R) continue;
        const chord = Math.sqrt(R * R - y * y);
        const lit =
          phase === null || (waxing ? x > k * chord : x < -k * chord);
        if (lit) disc(bx + x, by + y);
      }
    }
    /* An outline, so the disc still reads in light mode where "lit" means
       bare page and the day sky around it is nearly bare too. */
    for (let y = -R - 1; y <= R + 1; y++) {
      for (let x = -R - 1; x <= R + 1; x++) {
        const d = Math.hypot(x, y);
        if (d > R - 0.5 && d <= R + 0.5 && inSky(bx + x, by + y))
          stroke(bx + x, by + y);
      }
    }
    if (clock.isDay) {
      /* Four short rays: at nine pixels across, a bare circle in the daytime
         sky could just as easily be the moon. */
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let d = R + 3; d <= R + 5; d++) stroke(bx + dx * d, by + dy * d);
      }
    }

    /* A speck of falling weather has to survive being drawn onto a sky made
       of identical specks — ink on ink is invisible. Clearing its immediate
       neighbours first gives each flake a bit of still air to sit in, and that
       gap, not the pixel itself, is what separates it from the dither. Works
       in both schemes: a dark fleck in a light void, or the reverse. */
    const speck = (cells) => {
      for (const [x, y] of cells) {
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
          if (inSky(x + dx, y + dy)) punch(x + dx, y + dy);
        }
      }
      for (const [x, y] of cells) if (inSky(x, y)) stroke(x, y);
    };

    /* --- weather, whatever the season happens to be --- */
    if (season === "winter") {
      /* Flakes are ink rather than cleared pixels. Snow "should" be white, but
         on a pale page white snow against a pale sky is nothing at all; dark
         flecks are how a woodcut prints snow, and they read in both schemes. */
      const flakes = Math.round(width * SNOW_PER_PX);
      for (let i = 0; i < flakes; i++) {
        const fall = (seconds / SNOW_FALL + noise(i, 11)) % 1;
        const sway = Math.sin(seconds * 0.125 + noise(i, 13) * 6.3) * 3;
        const x = Math.round(noise(i, 7) * width + sway);
        const y = Math.round(fall * (HEIGHT + 4)) - 2;
        speck([[x, y]]);
      }
    } else if (season === "autumn") {
      /* Fewer than snowflakes, falling faster, swinging much wider, and drawn
         as a pair of pixels that flips between lying flat and standing on
         edge — which at this size is all "tumbling" needs to be. */
      const leaves = Math.round(width * LEAF_PER_PX);
      for (let i = 0; i < leaves; i++) {
        const fall = (seconds / LEAF_FALL + noise(i, 31)) % 1;
        const spin = seconds * 0.4 + noise(i, 37) * 6.3;
        const x = Math.round(noise(i, 33) * width + Math.sin(spin * 0.55) * 7.5);
        const y = Math.round(fall * (HEIGHT + 4)) - 2;
        /* Three cells rather than two now that there's room: a leaf lying
           flat, then standing on edge. */
        speck(
          Math.sin(spin) > 0
            ? [[x, y], [x + 1, y], [x + 2, y]]
            : [[x, y], [x, y + 1], [x, y + 2]],
        );
      }
    } else if (season === "summer") {
      /* Fireflies, and only once it's dark enough for them. Unlike the falling
         weather these read as light, so they're glow, not ink — which is also
         why they can only work at night, when there's a dense enough sky in
         light mode for a cleared pixel to show against. */
      if (starlight > 0.4) {
        const flies = Math.round(width * FIREFLY_PER_PX);
        for (let i = 0; i < flies; i++) {
          const x = Math.round(
            noise(i, 41) * width + Math.sin(seconds * 0.1 + noise(i, 43) * 6.3) * 9,
          );
          const xi = Math.max(0, Math.min(width - 1, x));
          const y = Math.round(
            ridge[xi] - 3 - noise(i, 45) * 12 +
              Math.sin(seconds * 0.1875 + noise(i, 47) * 6.3) * 2.25,
          );
          /* Lit only a fraction of the cycle: a firefly that stays on is just
             a star, and the blink is the whole point. Keeping them in a low
             band right over the ridge is the other half — height is what
             separates the swarm from the star field above it. */
          if ((seconds * 0.275 + noise(i, 49)) % 1 < 0.28) glow(x, y);
        }
      }
    } else if (season === "spring" && clock.daylight > 0.3) {
      /* A skein of geese crossing now and then. Ipswich is on the flyway, and
         a V of chevrons is one of the few things that survives being four
         pixels tall. */
      const p = (seconds / GEESE_PERIOD) % 1;
      if (p < 0.5) {
        const t = p / 0.5;
        const leadX = -18 + t * (width + 36);
        const leadY = 14 + Math.sin(t * 3.1) * 3.75;
        for (let i = 0; i < 7; i++) {
          const arm = i % 2 ? 1 : -1;
          const step = Math.ceil(i / 2);
          const bx = Math.round(leadX - step * 5);
          const by = Math.round(leadY + arm * step * 1.8);
          /* Wings beat on their own offset down the line, so the skein
             ripples instead of clapping in unison. */
          const wing = Math.sin(seconds * 2.5 - step * 0.9) > 0 ? -1 : 1;
          speck([
            [bx, by],
            [bx - 1, by + wing],
            [bx - 2, by + wing * 2],
            [bx + 1, by + wing],
            [bx + 2, by + wing * 2],
          ]);
        }
      }
    }

    /* --- the ridge and whatever is standing on it, always last --- */

    /* Anything that sinks brings a river with it. The channel runs between the
       bridge's own abutments, which is what the outer columns of that sprite
       are: the ground line stops against one, the water passes under the
       arches, and it picks up again on the far side. */
    let river = null;
    const spanning = sprites.find((s) => s.sink);
    if (spanning) {
      let deepest = 0;
      for (let c = 0; c < spanning.width; c++) {
        deepest = Math.max(deepest, ridge[spanning.x + c] ?? 0);
      }
      river = {
        from: spanning.x + 1,
        to: spanning.x + spanning.width - 1,
        surface: deepest + 6,
      };
    }

    for (let x = 0; x < width; x++) {
      if (river && x >= river.from && x < river.to) continue;
      /* Fill between this column's height and the next one's: a steep stretch
         of ridge drawn a pixel per column comes out as a dotted line. */
      const crestTop = Math.min(ridge[x], ridge[x + 1]);
      const crestBottom = Math.max(ridge[x], ridge[x + 1]);
      for (let y = crestTop; y <= crestBottom; y++) stroke(x, y);
    }

    /* A plume of puffs on staggered phases, each rising, leaning downwind and
       swelling as it goes, thinning to nothing at the top. Drawn as dithered
       ink rather than as a cleared shape: smoke is neither sky nor solid, and
       a stipple that thins with height is exactly what one ink can say. */
    const plume = (x0, y0, t) => {
      for (let i = 0; i < SMOKE_PUFFS; i++) {
        const p = (t / SMOKE_PERIOD + i / SMOKE_PUFFS) % 1;
        /* Thins as it rises, but only linearly. A squared falloff seems right
           and isn't: a new puff is small, so its densest moment covers barely
           a pixel, while the wide old puffs are too faint to survive the
           dither — and the plume adds up to nothing at all. The radius has to
           start large enough to have area while the density is still high. */
        const density = 0.85 * (1 - p);
        if (density < 0.02) continue;
        const cx = x0 + p * SMOKE_DRIFT + Math.sin(p * 5.2) * 0.9;
        const cy = y0 - 1 - p * SMOKE_RISE;
        const r = 2 + p * 3.6;
        const ri = Math.ceil(r);
        for (let dy = -ri; dy <= ri; dy++) {
          for (let dx = -ri; dx <= ri; dx++) {
            if (dx * dx + dy * dy > r * r) continue;
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (!inSky(px, py)) continue;
            if (density > threshold(px + 900, py + 900)) stroke(px, py);
          }
        }
      }
    };

    for (const item of sprites) {
      const rows = item.art.length;
      const t = clamp01((elapsed - item.delay) / RISE_MS);
      if (t <= 0) continue;
      const eased = easeOutBack(t);
      /* Below 1 the sprite is still emerging from behind the ridge, so only
         its lower rows exist yet; above 1 it's whole but lifted clear of the
         ground, which is the overshoot's little hop before it settles. */
      const visible = Math.min(rows, Math.round(rows * eased));
      const lift = Math.round(Math.max(0, eased - 1) * rows * OVERSHOOT);
      /* Anchored to the lowest ground under the sprite's whole footprint, not
         to its center column: on a step the center sits proud of the low side
         and the sprite visibly hovers. Burying it a pixel reads as planted;
         floating never does. */
      let ground = 0;
      for (let col = 0; col < item.width; col++) {
        ground = Math.max(ground, ridge[item.x + col] ?? 0);
      }
      const base = ground - lift + (item.sink ?? 0);

      for (let row = rows - visible; row < rows; row++) {
        const line = item.art[row];
        const y = base - (rows - 1 - row);
        for (let col = 0; col < line.length; col++) {
          const cell = line[col];
          if (cell === "#") stroke(item.x + col, y);
          else if (cell === "o") punch(item.x + col, y);
        }
      }

      /* Only once the house is up — smoke from a half-built chimney reads as
         a bug, and during the rise the anchor is still moving. */
      if (item.smoke && t >= 1) {
        const [col, row] = item.smoke;
        plume(item.x + col, base - (rows - 1 - row), seconds);
      }
    }

    /* The water, drawn after the bridge so it can fill the arch openings
       without painting over the stone — hence the check for an empty pixel.
       Horizontal dashes on a slow drift: three rows deep, that is all a river
       needs to be, and the drift is what keeps it from reading as a shadow. */
    if (river) {
      /* One dashed surface row with a couple of sparse ones under it, sitting
         low in the arch. Filling half the opening with speckle read as rubble
         packed under the bridge rather than as water passing beneath it: what
         makes it water is a *line* with clear span above it. */
      const drift = Math.floor(seconds * 0.7);
      for (let depth = 0; depth < 3; depth++) {
        const y = river.surface + depth;
        for (let x = river.from - 1; x <= river.to; x++) {
          if (!inside(x, y) || grid[y * width + x] !== 0) continue;
          const phase = (((x + drift + depth * 3) % 6) + 6) % 6;
          if (depth === 0 ? phase < 4 : phase < 1) stroke(x, y);
        }
      }
    }

    /* Fresh ImageData is transparent black, so only the inked pixels need
       writing — the rest stay clear and the page shows through. */
    const image = ctx.createImageData(width, HEIGHT);
    for (let i = 0; i < width * HEIGHT; i++) {
      if (!grid[i]) continue;
      const c = grid[i] === 2 ? bodyColor : ink;
      image.data[i * 4] = c[0];
      image.data[i * 4 + 1] = c[1];
      image.data[i * 4 + 2] = c[2];
      image.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return clock;
  }

  /* ------------------------------------------------------------------ *
   * Run
   * ------------------------------------------------------------------ */

  /* The build is a one-time flourish, not a page decoration: replaying it on
     every navigation of a multi-page site would wear out fast. First load in a
     session animates; the rest arrive already built — but the sky itself keeps
     moving either way, so a page that skips the build is never still. */
  const SEEN = "sky-built";
  let build = !reduced.matches;
  try {
    if (sessionStorage.getItem(SEEN)) build = false;
    sessionStorage.setItem(SEEN, "1");
  } catch {
    /* Private windows and blocked site data throw on access; playing the build
       every load is the right side to fail on. */
  }

  const settleTime = () =>
    sprites.reduce((latest, s) => Math.max(latest, s.delay), 0) + RISE_MS;

  let ambient = null;
  let label = "";

  const paint = (elapsed) => {
    const clock = draw(elapsed, performance.now() / 1000);
    /* Reannounce only when the described scene actually changes — a label
       rewritten eight times a second is a screen reader read aloud forever. */
    const next = describe(clock);
    if (next !== label) {
      label = next;
      canvas.setAttribute("aria-label", next);
    }
  };

  /* Stars twinkle and clouds drift for as long as the page is on screen. The
     visibility check matters more than the frame rate does: without it this
     keeps a backgrounded tab's CPU awake for nothing. */
  function startAmbient() {
    if (reduced.matches || ambient !== null) return;
    ambient = setInterval(() => {
      if (document.hidden) return;
      paint(Infinity);
    }, AMBIENT_MS);
  }

  function start() {
    if (!resize()) return;
    sprites = place(width);
    if (!build) {
      paint(Infinity);
      startAmbient();
      return;
    }
    const startedAt = performance.now();
    const done = settleTime();
    const frame = (now) => {
      const elapsed = now - startedAt;
      paint(elapsed);
      if (elapsed < done) requestAnimationFrame(frame);
      else startAmbient();
    };
    requestAnimationFrame(frame);
  }

  document.body.prepend(canvas);
  start();

  /* Resizing changes how many art pixels fit, so the scene is regenerated
     rather than stretched — but not re-animated, which would make dragging a
     window edge into a fireworks show. Guarded on width because setting the
     height above re-triggers the observer. */
  new ResizeObserver(() => {
    if (canvas.clientWidth === lastCssWidth) return;
    if (!resize()) return;
    sprites = place(width);
    paint(Infinity);
  }).observe(canvas);

  /* Which pixel value means "light" flips with the scheme, so a scheme change
     is a redraw, not just a recolor. */
  schemeQuery.addEventListener("change", (e) => {
    dark = e.matches;
    readTheme();
    paint(Infinity);
  });

  /* Honoring a reduced-motion preference the reader turns on mid-visit costs
     one listener, and leaves the scene up rather than blanking it. */
  reduced.addEventListener("change", (e) => {
    if (e.matches && ambient !== null) {
      clearInterval(ambient);
      ambient = null;
    } else if (!e.matches) {
      startAmbient();
    }
  });
})();

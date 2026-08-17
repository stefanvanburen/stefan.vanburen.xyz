# https://just.systems

# Run the development server, building drafts.
[default]
dev:
    hugo server --buildDrafts --openBrowser --navigateToChanged --buildFuture --renderToMemory

# Build the site.
build:
    rm -rf public
    hugo build --minify
    # Rasterize the (seasonal, build-time-generated) SVG favicon into an
    # apple-touch-icon, since iMessage's link-preview icon fallback doesn't
    # reliably support SVG. Not checked in: generated fresh every build so it
    # always matches the current seasonal favicon.
    rsvg-convert --width 180 --height 180 public/favicon.min.svg -o public/apple-touch-icon.png
    # Same rasterization, at favicon size: declaring an SVG <link rel="icon">
    # suppresses the browser's implicit /favicon.ico fallback, so clients that
    # can't render an SVG favicon need an explicit raster to fall back to.
    rsvg-convert --width 32 --height 32 public/favicon.min.svg -o public/favicon.png
    # And once more for the Atom feeds' <icon>, which feed readers render at
    # anything up to a retina list icon — 32px would be visibly soft there.
    rsvg-convert --width 512 --height 512 public/favicon.min.svg -o public/icon-512.png

# Format Go templates in layouts/, via the pinned gotmplfmt prek installs.
fmt:
    prek run gotmplfmt --all-files

# Run all git hooks against every file.
lint:
    prek run --all-files

# Upload an already-built public/ to pages.sr.ht.
upload:
    tar --directory public --create --gzip --verbose . > site.tar.gz
    hut pages publish --domain stefan.vanburen.xyz --site-config siteconfig.json site.tar.gz

# Build and publish the site.
publish: build upload

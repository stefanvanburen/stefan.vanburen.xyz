# https://just.systems

# Cache for version-pinned tool binaries, downloaded on demand. Modeled on
# https://github.com/bufbuild/makego/blob/main/make/go/dep_golangci_lint.mk:
# each pinned version lives in its own directory under `versions/`, and
# `bin/<tool>` is a symlink to whichever version is currently pinned below.
# Bumping a `*_version` variable naturally invalidates the symlink target,
# triggering a re-download next run, while old versions stay cached.
cache_dir := home_directory() / ".cache" / "stefan.vanburen.xyz" / os() / arch()
cache_bin := cache_dir / "bin"
cache_versions := cache_dir / "versions"

# https://github.com/gohugoio/gotmplfmt/releases
gotmplfmt_version := "v0.4.1"
gotmplfmt := cache_bin / "gotmplfmt"

# Ensure gotmplfmt is downloaded and pinned at gotmplfmt_version.
#
# prek may invoke this recipe several times concurrently (it batches hook
# file args across parallel processes), so the install + symlink-swap below
# is guarded by an mkdir-based lock: `mkdir` is atomic, so only one
# concurrent invocation wins the lock at a time and the rest wait, avoiding
# both a torn `go install` and a racy `ln -sf` ("File exists" from two
# processes replacing the same symlink at once).
[private]
gotmplfmt-install:
    #!/usr/bin/env bash
    set -euo pipefail
    version_dir="{{ cache_versions }}/gotmplfmt/{{ gotmplfmt_version }}"
    version_bin="$version_dir/gotmplfmt"
    mkdir -p "{{ cache_bin }}" "{{ cache_versions }}/gotmplfmt"
    lock_dir="{{ cache_versions }}/gotmplfmt/.lock-{{ gotmplfmt_version }}"
    until mkdir "$lock_dir" 2>/dev/null; do sleep 0.05; done
    trap 'rmdir "$lock_dir" 2>/dev/null || true' EXIT
    if [ ! -x "$version_bin" ]; then
        echo "installing gotmplfmt {{ gotmplfmt_version }}..." >&2
        rm -rf "$version_dir"
        mkdir -p "$version_dir"
        GOBIN="$version_dir" go install "github.com/gohugoio/gotmplfmt@{{ gotmplfmt_version }}"
    fi
    ln -sf "$version_bin" "{{ gotmplfmt }}"

# Run the pinned gotmplfmt against the given files (used by prek).
[private]
gotmplfmt-run *files: gotmplfmt-install
    {{ gotmplfmt }} -w {{ files }}

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

# Format Go templates in layouts/.
fmt: gotmplfmt-install
    {{ gotmplfmt }} -w layouts/

# Run all git hooks against every file.
lint:
    prek run --all-files

# Publish the site.
publish: build
    tar --directory public --create --gzip --verbose . > site.tar.gz
    hut pages publish --domain stefan.vanburen.xyz --site-config siteconfig.json site.tar.gz

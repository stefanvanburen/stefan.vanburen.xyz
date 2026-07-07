# https://just.systems

[private]
@default: dev

# Run the development server, building drafts.
dev:
    hugo server --buildDrafts --openBrowser --navigateToChanged --buildFuture --renderToMemory

# Build the site.
build:
    rm -rf public
    hugo build --minify

# Run all git hooks against every file.
lint:
    prek run --all-files

# Publish the site.
publish: build
    tar --directory public --create --gzip --verbose . > site.tar.gz
    hut pages publish --domain stefan.vanburen.xyz --site-config siteconfig.json site.tar.gz

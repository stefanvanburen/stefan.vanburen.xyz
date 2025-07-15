# https://just.systems

[private]
@default: dev

# Run the development server, building drafts.
dev:
    hugo server --buildDrafts --openBrowser --navigateToChanged --buildFuture

# Build the site.
build:
    hugo

# Publish the site.
publish:
    rm -rf public
    hugo
    tar --directory public --create --gzip --verbose . > site.tar.gz
    hut pages publish --domain stefan.vanburen.xyz --site-config siteconfig.json site.tar.gz

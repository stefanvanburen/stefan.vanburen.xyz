# Run the development server, building drafts.
dev:
    hugo server --buildDrafts

# Build the site.
build:
    hugo

# Publish the site.
publish:
    rm -rf public
    hugo
    tar --directory public --create --gzip --verbose . > site.tar.gz
    hut pages publish --domain stefan.vanburen.xyz site.tar.gz

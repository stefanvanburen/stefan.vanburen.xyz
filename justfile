dev:
	hugo server -D

clean:
	rm -rf public

build:
	hugo --gc --minify

rebuild: clean build

deploy: rebuild
	# NOTE: cannot use the --delete option because it removes the local
	# directories caddy uses to run.
	rsync -azvhP public/ droplet:/var/lib/caddy/
	just caddy

caddy:
	rsync -azvhP Caddyfile droplet:/etc/caddy/Caddyfile
	# TODO: only restart if Caddyfile has changed
	ssh droplet 'systemctl restart caddy'

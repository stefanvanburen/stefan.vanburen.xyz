dev:
	hugo server -D

deploy:
	rm -rf public
	hugo --gc --minify
	# NOTE: cannot use the --delete option because it removes the local
	# directories caddy uses to run.
	rsync -azvhP public/ droplet:/var/lib/caddy/
	rsync -azvhP Caddyfile droplet:/etc/caddy/Caddyfile
	# TODO: only restart if Caddyfile has changed
	# ssh droplet 'systemctl restart caddy'

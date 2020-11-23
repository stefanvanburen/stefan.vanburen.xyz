dev:
	hugo server -D

deploy:
	rm -rf public
	# set NODE_ENV to production so that tailwind knows to purge styles
	NODE_ENV=production hugo --gc --minify
	# NOTE: cannot use the --delete option because it removes the local
	# directories caddy uses to run.
	rsync -azvhP public/ droplet:/var/lib/caddy/
	rsync -azvhP Caddyfile droplet:/etc/caddy/Caddyfile
	ssh droplet 'systemctl restart caddy'

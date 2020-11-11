dev:
	hugo server -D

deploy:
	rm -rf public
	hugo --gc --minify
	rsync -azvhP public/ droplet:/var/lib/caddy/
	rsync -azvhP Caddyfile droplet:/etc/caddy/Caddyfile
	ssh droplet 'systemctl restart caddy'

dev:
	hugo server -D

deploy:
	rm -rf public
	hugo --gc --minify
	rsync -azvhP public/ droplet:/var/lib/caddy/
	ssh droplet 'systemctl restart caddy'

dev:
	hugo server -D

install:
	npm install

lint:
	npx stylelint 'assets/*.css'
	markdownlint-cli2 "content/**/*.md"

fix:
	markdownlint-cli2-fix "content/**/*.md"

clean:
	rm -rf public/
	rm -rf resources/

htmltest:
	hugo && htmltest -s

dev:
	hugo server -D

install:
	npm install

build:
	hugo

htmltest:
	just build
	htmltest -s

html-validate:
	just build
	npx html-validate "public/**/*.html"

lint:
	just htmltest
	just html-validate
	npx stylelint 'assets/*.css'
	npx markdownlint-cli2 "content/**/*.md"

clean:
	rm -rf public/
	rm -rf resources/

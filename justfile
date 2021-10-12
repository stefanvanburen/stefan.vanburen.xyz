dev:
	hugo server -D

deps:
	npm i -D

lint: deps
	npx stylelint "assets/*.css"

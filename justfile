dev:
	hugo server -D

install:
	npm install

lint:
	npx stylelint 'assets/*.css'

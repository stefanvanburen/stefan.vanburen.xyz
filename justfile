install:
	npm install

lint:
	npx stylelint 'assets/*.css'

dev:
	hugo server -D

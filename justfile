dev:
	hugo server -D

lint:
	npx stylelint "assets/*.css"

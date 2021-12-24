STYLELINT ?= ./node_modules/.bin/stylelint

${STYLELINT}:
	npm i -D

lint: ${STYLELINT}
	npx stylelint "assets/*.css"

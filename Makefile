NAME   := curbside-pickup-dev/app
VERSION := 1.0.0
AWS_REPO := 479118988511.dkr.ecr.us-west-2.amazonaws.com/${NAME}

IMG    := ${NAME}
VERSIONED := ${NAME}:${VERSION}
LATEST := ${NAME}:latest
AWS_VERSIONED := ${AWS_REPO}:${VERSION}
AWS_LATEST := ${AWS_REPO}:latest
RUN_COMMAND = docker run --curbside-pickup-dev/app --rm -p 3000:3000 ${LATEST}
login: LOGIN_COMMAND := $(shell aws ecr get-login --no-include-email --region us-west-2)

build:
	@cd client
	@npm run build
	@cd ..
	@docker build -t ${IMG} .
	@docker tag ${IMG} ${VERSIONED}
	@docker tag ${IMG} ${LATEST}
	@docker tag ${IMG} ${AWS_VERSIONED}
	@docker tag ${IMG} ${AWS_LATEST}

push: login
	@docker push ${AWS_VERSIONED}
	@docker push ${AWS_LATEST}

#creates a shell inside docker image so you can look around
shell:
	@docker run --rm -it --entrypoint=/bin/sh ${LATEST}

run:
	@${RUN_COMMAND}

login: 
	@${LOGIN_COMMAND}
DOCKER_USERNAME ?= $(shell whoami)
# FIXME: change this to the desired Docker image name
APPLICATION_NAME ?= example

GIT_HASH ?= $(shell git log --format="%h" -n 1)

image:
	docker buildx build \
		--platform linux/amd64 \
		-t ${DOCKER_USERNAME}/${APPLICATION_NAME}:${GIT_HASH} \
		-f ./docker/example.Dockerfile .

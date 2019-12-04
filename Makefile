commitID=$(shell git log --pretty=format:"%H" -1)

# TODO: 需要根据项目实际情况替换端口号、标签名和项目名

container_name=projectName
port=4004
tag=latest

build-image:
	@echo "============= docker build image ============="
	docker build -t jweboy/${container_name}:${tag} .
run-container:
	@echo "============= docker run container ============="
	docker run -p ${port}:${port} -d --name ${container_name} --network network-connect-middleware --rm jweboy/${container_name}:${tag}
remove-container:
	@echo "============= remove container ============="
	docker rm -f ${container_name}
stop-container:
	@echo "============= stop container ============="
	docker stop ${container_name}
push-image:
	@echo "============= docker push image ============="
	docker push jweboy/${container_name}:${tag}
pull-image:
	@echo "============= docker pull image ============="
	docker pull jweboy/${container_name}:${tag}

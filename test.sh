# TODO: 需要根据项目实际情况替换项目名

container_name="nginx-service"

make build-image

# cleanup container if exited but stoped
if [ "$(docker ps -a -f status=exited -f name=${container_name})" ]; then
   make remove-container
fi

# cleanup
if [ "$(docker ps -a | grep ${container_name})" ]; then
    make stop-container
fi

make run-container

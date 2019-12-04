#!/bin/sh

# TODO: 需要根据项目实际情况替换端口号、标签名和项目名

port=4004
tag="latest"
container_name="projectName"
image_name="jweboy/${container_name}:${tag}"

# pull image
docker pull ${image_name}

# cleanup container if exited but stoped
if [ "$(docker ps -a -f status=exited -f name=${container_name})" ]; then
    docker rm -f ${container_name}
fi

# cleanup
if [ "$(docker ps -a | grep ${container_name})" ]; then
    docker stop ${container_name}
fi

# restart
docker run -p ${port}:${port} -d --name ${container_name}  --network network-connect-middleware --rm ${image_name}


# 检查容器是否存在
# if [ ! "$(docker ps -q -f name=${container_name})" ]; then
#     if [ "$(docker ps -aq -f status=running -f name=${container_name})" ]; then
#         # cleanup
#         docker stop ${container_name}
#     fi
#         # restart
#         docker run -p 4004:4004 -d --name ${container_name}  --network network-connect-middleware --rm jweboy/${container_name}:0.0.1
# fi

# https://stackoverflow.com/questions/38576337/how-to-execute-a-bash-command-only-if-a-docker-container-with-a-given-name-does

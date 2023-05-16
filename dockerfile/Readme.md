# <p>Running rpc in docker.<p>

##First make sure you have docker running. To test it run hello world.

https://hub.docker.com/_/hello-world
docker pull hello-world

##To run the rpc the first thing to do is to change in the rpc configuration the user.

##After that you have to build the dockerfile.

docker build -t rpc .

##Once built, to execute the container

docker run rpc

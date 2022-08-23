docker rmi isoxml-visualization --force
DOCKER_BUILDKIT=1 docker build --no-cache --ssh github=/home/frank/.ssh/rsa_id_github -t isoxml-visualization .
docker run -p 3000:8000 --name isoxml-visualization --network net -e VIRTUAL_HOST="isoxml-viewer.dev4ag.com" -e LETSENCRYPT_HOST="isoxml-viewer.dev4ag.com" -d isoxml-visualization &

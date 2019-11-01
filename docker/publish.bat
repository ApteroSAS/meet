IF [%1] == [] GOTO error

docker login
call build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-hub:latest registry.aptero.co/aptero-hub:latest
docker push registry.aptero.co/aptero-hub:latest

docker tag aptero-hub:latest registry.aptero.co/aptero-hub:%1
docker push registry.aptero.co/aptero-hub:%1

GOTO :EOF
:error
ECHO incorrect_parameters
@echo off
docker-compose stop
docker-compose kill
REM FOR /f "tokens=*" %%i IN ('docker container ls') DO docker container stop %%i
FOR /f "tokens=*" %%i IN ('docker ps -aq') DO docker rm %%i
FOR /f "tokens=*" %%i IN ('docker images --format "{{.ID}}"') DO docker rmi %%i
docker system prune -af
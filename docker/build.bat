rem call npm install
rem call npm run build

RMDIR /s /q .\www\
cd ..
call npm run build
cd docker

xcopy ..\dist .\www\ /s /e

docker build -t aptero-hub .

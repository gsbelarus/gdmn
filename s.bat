set NODE_OPTIONS=--openssl-legacy-provider

cd src\gdmn-back
start yarn start

cd ..\..\src\gdmn-front
start yarn start

cd ..\..

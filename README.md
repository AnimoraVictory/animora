# animalia
.envは持っている人にもらってください

backの立ち上げ手順

backに移動し

npm install

npm run build

を実行したのち

docker compose build
及び
docker compose up

その後

npm run prisma:m
でマイグレーションを実行してください

backが立ち上がったら
frontに移動して
npm i
npm run devを実行

localhost:5173
にてfrontにアクセスできます

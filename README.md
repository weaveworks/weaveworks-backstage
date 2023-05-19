# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
# create a cluster
kind create cluster

# install flux
flux install

# setup cluster auth and create an example podinfo helmrelease
kubectl apply -f ./demo

# install deps
yarn install

# copy the kubernetes config to local config (.gitignore'd)
cp ./app-config.kubernetes.yaml ./app-config.local.yaml

# start the app, configuring backstage to use serviceaccount in ./demo
./startup.sh
```

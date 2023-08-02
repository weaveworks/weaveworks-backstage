This repo contains the [Backstage](https://backstage.io) plugins created and maintained by [weaveworks](https://www.weave.works/).

The following plugins can be found within this repo:

- [Flux](https://github.com/weaveworks/weaveworks-backstage/blob/main/plugins/backstage-plugin-flux/)

Installation instructions for the plugins can be found in their individual README files.

##

## Getting Started

To get up and running with this repository, you will need to:

- clone it off of GitHub

```bash
git clone git@github.com:weaveworks/weaveworks-backstage.git
cd weaveworks-backstage
```

- set up a Github OAuth app and
- set up a local kubernetes cluster.

### Configure Github OAuth

Follow the [Backstage instructions to create a Github OAuth app](https://backstage.io/docs/auth/github/provider#create-an-oauth-app-on-github), relevant bit here:

> To add GitHub authentication create an OAuth App from the GitHub [developer settings](https://github.com/settings/developers). The Homepage URL should point to Backstage's frontend, while the Authorization callback URL will point to the auth backend.
>
> - **Application name**: Backstage
> - **Homepage URL**: http://localhost:3000
> - **Authorization callback URL**: http://localhost:7007/api/auth/github/handler/frame

Save the **clientId** and **clientSecret** that Github generates into a `.env` file or your `~/.bashrc` / `~/.zshrc`:

```bash
export AUTH_GITHUB_CLIENT_ID=abc123
export AUTH_GITHUB_CLIENT_SECRET=abc123
```

They're referenced in the `app-config.kubernetes.yaml` file.

### Start a local kubernetes cluster

To start the app, run:

```sh
# create a cluster
kind create cluster

# install flux
flux install

# setup cluster auth and create an example podinfo helmrelease
kubectl apply -f ./demo

# install deps (node version 14 || >=16.14 required)
yarn install

# (Optional) Provide the base URL to the weave-gitops app to link through from resources displayed in Backstage.
export WEAVE_GITOPS_URL=http://localhost:9001

# start the app
./startup.sh
```

## _(optional)_ Install `weave-gitops` to demonstrate linking through to resources details

Backstage shows the important information about each resource, you can click through to the weave-gitops UI to see even more details. The URL is provided by the `WEAVE_GITOPS_URL` environment variable as shown above.

Follow the weave-gitops [installation instructions](https://docs.gitops.weave.works/docs/next/open-source/getting-started/install-OSS/).

In short:

> ```sh
> brew tap weaveworks/tap
> brew install weaveworks/tap/gitops
> gitops create dashboard ww-gitops --password="some-password"
> kubectl port-forward svc/ww-gitops-weave-gitops -n flux-system 9001:9001
> ```

Login to http://localhost:9001 with the username `admin` and the password you provided when creating the dashboard.

## Community

[Contributing](https://github.com/weaveworks/weaveworks-backstage/blob/main/CONTRIBUTING.md) - Start here if you want to contribute

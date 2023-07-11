# [Backstage](https://backstage.io)

## Local dev

For local dev we'll need to set up a Github OAuth app and a local kubernetes cluster.

Please ensure you're running a recent version of Flux supported versions are > 2.0.0

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
WEAVE_GITOPS_URL=http://localhost:9001 ./startup.sh
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

## Releasing

Publishing a **GitHub release** will trigger a GitHub Action to build and push the npm module to the [backstage-plugin-flux npm package](https://www.npmjs.com/package/@weaveworksoss/backstage-plugin-flux).

### Create the release

Create a [new Github release](https://github.com/weaveworks/weaveworks-backstage/releases/new)

1. Click "Choose a tag" and type in the tag that the release should create on publish (e.g. `v0.5.0`)
2. Click **Generate release notes**
3. Click **Publish release**

After a few minutes the release should be available on npm.

Follow the [backstage-plugin-flux installation instructions](./plugins/backstage-plugin-flux/README.md) to upgrade the plugin in your Backstage app.

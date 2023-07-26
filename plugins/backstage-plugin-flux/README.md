# Flux plugin for Backstage

The Flux plugin for Backstage provides views of [Flux](https://fluxcd.io/) resources available in Kubernetes clusters.

![FluxEntityHelmReleasesCard](helm_releases_card.png)

## Content

All these cards display the relevant resources for the currently displayed entity.

- FluxEntityHelmReleasesCard
- FluxEntityGitRepositoriesCard
- FluxEntityOCIRepositoriesCard
- FluxEntityHelmRepositoriesCard

## Prerequisite

The Kubernetes plugins including `@backstage/plugin-kubernetes` and `@backstage/plugin-kubernetes-backend` are installed and configured by following the installation and configuration guides.

The Kubernetes plugin is configured and connects to the cluster using a ServiceAccount.

You will need to bind the ServiceAccount to the `helmrelease-viewer-role` that [comes](https://github.com/fluxcd/helm-controller/blob/main/config/rbac/helmrelease_viewer_role.yaml) with Flux.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backstage-cluster-view-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: helmrelease-viewer-role
subjects:
  - kind: ServiceAccount
    name: backstage # replace with the name of the SA that your Backstage runs as
    namespace: flux-system
```

## Installation

Install the plugin dependency in your Backstage app package:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @weaveworksoss/backstage-plugin-flux
```

## Configuration

The Flux plugins provide several different Cards, which are composable into your Backstage App.

1. Add the card to your app EntityPage.tsx

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import { FluxEntityHelmReleasesCard } from '@weaveworksoss/backstage-plugin-flux';

// You can add the tab to any number of pages, the service page is shown as an
// example here
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    // ...
    <Grid item md={4} xs={12}>
      <FluxEntityHelmReleasesCard />
    </Grid>
    // ...
  </Grid>
);
```

The card has a `many` property which is `true` by default. If your card table is likely to have just a few items, you can switch this to `false` to hide the filtering, searching and pagination options in the card table.

```tsx
<Grid item md={4} xs={12}>
  <FluxEntityHelmReleasesCard many={false} />
</Grid>
```

2. Add a page to your app EntityPage.tsx

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  FluxEntityHelmReleasesCard,
  FluxEntityGitRepositoriesCard,
  FluxEntityOCIRepositoriesCard,
  FluxEntityHelmRepositoriesCard,
} from '@weaveworksoss/backstage-plugin-flux';

const serviceEntityPage = (
  <EntityLayout>
    // ...
    <Grid container spacing={3} alignItems="stretch">
      <Grid item md={12}>
        <FluxEntityHelmReleasesCard />
      </Grid>
      <Grid item md={12}>
        <FluxEntityHelmRepositoriesCard />
      </Grid>
      <Grid item md={12}>
        <FluxEntityGitRepositoriesCard />
      </Grid>
      <Grid item md={12}>
        <FluxEntityOCIRepositoriesCard />
      </Grid>
    </Grid>
    // ...
  </EntityLayout>
);
```

3. Add the [backstage.io/kubernetes-id](https://backstage.io/docs/features/kubernetes/configuration/#common-backstageiokubernetes-id-label) to your Backstage entity.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: carts-service
  description: A microservices-demo service that provides shopping carts for users
  tags:
    - java
  annotations:
    backstage.io/kubernetes-id: carts-service
spec:
  type: service
  lifecycle: production
  owner: sockshop-team
  system: carts
```

4. Label your Flux HelmRelease with the correct label:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: carts-nginx
  namespace: carts
  labels:
    backstage.io/kubernetes-id: carts-service
spec:
  chart:
    spec:
      chart: nginx
      reconcileStrategy: ChartVersion
      sourceRef:
        kind: HelmRepository
        name: podinfo
  interval: 1m0s
```

5. [Optional] Configure linking through to Weave GitOps, configure your `app-config.yaml`

If you have [Weave GitOps](https://www.weave.works/product/gitops/) or [Weave GitOps Enterprise](https://www.weave.works/product/gitops-enterprise/) you can configure the plugins to link through to the UI which will provide more information on the resources.

This will generate link URLs through to the relevant UIs relative to the configured URL, for example to view Helm Repositories, this would generate a URL that looks like this `https://wego.example.com/wego/helm_repo/details?clusterName=demo-cluster&name=podinfo&namespace=default`.

```yaml
# app-config.yaml

gitops:
  #
  baseUrl: https://wego.example.com
```

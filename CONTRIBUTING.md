## Plugin dev tips

### `./dev` mode

You can start up the plugin UI with mock data to easily test UI variations:

`cd plugins/backstage-plugin-flux`
`yarn start`

### Add a new card

- Under `Components`, create a new folder following the structure of the other cards:
  - entry point: index
  - card containing the relevant table and where data is retrieved
  - table: use `FluxEntityTable` to which you pass the needed `defaultColumns` (some of most used ones can be found in `helpers`)
- In `objects.ts`, add the type of data that the table will be using
- In order to retrieve data, we use hooks (`hooks/query.ts`). Add a new hook for the desired type of data (make use of `useCustomResources` provided by Backstage).
- Add the component (card) extension to the list in `plugin.ts`
- To test in dev mode, add a page containing the card to `dev/index.tsx`. Add a data generator for your resource in `dev/helpers`. Then, back in index, making use of the `StubKubernetesClient` and helper function, add test objects to the page.

### Table reference

This project is using Material UI 3.2.5. To find out more about this specific release you can visit:
https://github.com/material-table-core/core/tree/v3.2.5

To update the styles and functionality of the tables used, check out the available options at:
https://github.com/material-table-core/core/blob/v3.2.5/types/index.d.ts

## Releasing

Publishing a **GitHub release** will trigger a GitHub Action to build and push the npm module to the [backstage-plugin-flux npm package](https://www.npmjs.com/package/@weaveworksoss/backstage-plugin-flux).

### Create the release

Create a [new Github release](https://github.com/weaveworks/weaveworks-backstage/releases/new)

1. Click "Choose a tag" and type in the tag that the release should create on publish (e.g. `v0.5.0`)
2. Click **Generate release notes**
3. Click **Publish release**

After a few minutes the release should be available on npm.

Follow the [backstage-plugin-flux installation instructions](./plugins/backstage-plugin-flux/README.md) to upgrade the plugin in your Backstage app.

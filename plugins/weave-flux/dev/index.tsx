import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { weaveFluxPlugin, WeaveFluxPage } from '../src/plugin';

createDevApp()
  .registerPlugin(weaveFluxPlugin)
  .addPage({
    element: <WeaveFluxPage />,
    title: 'Root Page',
    path: '/weave-flux'
  })
  .render();

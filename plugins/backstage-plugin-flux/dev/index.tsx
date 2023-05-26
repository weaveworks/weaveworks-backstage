import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { weaveFluxPlugin, FluxHelmReleaseCard } from '../src/plugin';

createDevApp()
  .registerPlugin(weaveFluxPlugin)
  .addPage({
    element: <FluxHelmReleaseCard />,
    title: 'Root Page',
    path: '/weave-flux',
  })
  .render();

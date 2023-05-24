import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { weaveFluxPlugin, WeaveFluxCard } from '../src/plugin';

createDevApp()
  .registerPlugin(weaveFluxPlugin)
  .addPage({
    element: <WeaveFluxCard />,
    title: 'Root Page',
    path: '/weave-flux',
  })
  .render();

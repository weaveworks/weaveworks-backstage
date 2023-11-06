import { Content, Header, Page } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core';
import React from 'react';
import { FluxRuntimeCard } from '../FluxRuntimeCard';

const useStyles = makeStyles(() => ({
  overflowXScroll: {
    overflowX: 'scroll',
  },
}));

export interface FluxRuntimePageProps {
  /**
   * Title
   */
  title?: string;
  /**
   * Subtitle
   */
  subtitle?: string;
  /**
   * Page Title
   */
  pageTitle?: string;
}

/**
 * Main Page of Flux Runtime
 *
 * @public
 */
export function FluxRuntimePage(props: FluxRuntimePageProps) {
  const { title = 'Flux Runtime' } = props;
  const classes = useStyles();

  return (
    <Page themeId="tool">
      <Header title={title} />
      <Content className={classes.overflowXScroll}>
        <FluxRuntimeCard />
      </Content>
    </Page>
  );
}

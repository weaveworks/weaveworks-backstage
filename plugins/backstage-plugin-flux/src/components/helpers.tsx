import React from 'react';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { Link, Progress } from '@backstage/core-components';
import { IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import {
  GitRepository,
  OCIRepository,
  useSyncResource,
  SyncResource,
  useWeaveFluxDeepLink,
} from '../hooks';
import {
  VerifiableSource,
  findVerificationCondition,
  useStyles,
} from './utils';

/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({
  resource,
}: {
  resource: HelmRelease | GitRepository | OCIRepository;
}): JSX.Element => {
  const { name, namespace } = resource;
  const deepLink = useWeaveFluxDeepLink(resource);
  const label = `${namespace}/${name}`;

  if (!deepLink) {
    return <span style={{ fontWeight: 600 }}>{label}</span>;
  }

  return (
    <Link style={{ fontWeight: 600 }} to={deepLink}>
      {label}
    </Link>
  );
};

export function SyncButton({ resource }: { resource: SyncResource }) {
  const { sync, isSyncing } = useSyncResource(resource);

  const classes = useStyles();
  const title = `sync ${resource.namespace}/${resource.name}`;

  return isSyncing ? (
    <Progress title="syncing" />
  ) : (
    <IconButton
      title={title}
      className={classes.syncButton}
      size="small"
      onClick={sync}
    >
      <RetryIcon />
    </IconButton>
  );
}

export function syncColumn() {
  return {
    title: '',
    render: (row: SyncResource) => {
      return <SyncButton resource={row} />;
    },
    width: '24px',
  };
}

export const verifiedStatus = ({
  resource,
}: {
  resource: VerifiableSource;
}): JSX.Element => {
  const condition = findVerificationCondition(resource);

  let color = '#d8d8d8';
  if (condition?.status === 'True') {
    color = '#27AE60';
  } else if (condition?.status === 'False') {
    color = '#BC3B1D';
  }

  // TODO: Alternative icon?

  return (
    <Tooltip title={condition?.message || ''}>
      <VerifiedUserIcon style={{ color, height: '16px' }} />
    </Tooltip>
  );
};

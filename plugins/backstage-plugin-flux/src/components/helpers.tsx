import React from 'react';
import { HelmRelease } from '@weaveworks/weave-gitops';
import { Link, Progress } from '@backstage/core-components';
import { IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import {
  GitRepository,
  OCIRepository,
  SyncResource,
  useWeaveFluxDeepLink,
} from '../hooks';
import { useSyncResource } from '../hooks/useSyncResource';
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
  const label = `${resource.namespace}/${resource.name}`;

  return isSyncing ? (
    <Tooltip title={`Syncing ${label}`}>
      {/* seem to need a div here as tooltipping onto <Progress/> doesn't work */}
      <div>
        <Progress data-testid="syncing" />
      </div>
    </Tooltip>
  ) : (
    <Tooltip title={`Sync ${label}`}>
      <IconButton
        data-testid={`sync ${label}`}
        className={classes.syncButton}
        size="small"
        onClick={sync}
      >
        <RetryIcon />
      </IconButton>
    </Tooltip>
  );
}

export function syncColumn() {
  return {
    title: 'Sync',
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

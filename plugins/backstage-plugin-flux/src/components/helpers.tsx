import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Link, Progress } from '@backstage/core-components';
import { IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { SyncResource, useSyncResource, useWeaveFluxDeepLink } from '../hooks';
import {
  VerifiableSource,
  automationLastUpdated,
  findVerificationCondition,
  useStyles,
} from './utils';
import { GitRepository, HelmRelease, OCIRepository } from '../objects';
import Flex from './Flex';
import KubeStatusIndicator from './KubeStatusIndicator';

const UrlWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  direction: rtl;
  max-width: 350px;
`;

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
  const classes = useStyles();

  if (!deepLink) {
    return <span className={classes.nameLabel}>{label}</span>;
  }

  return (
    <Link className={classes.nameLabel} to={deepLink}>
      {label}
    </Link>
  );
};

export function SyncButton({ resource }: { resource: SyncResource }) {
  const { sync, isSyncing } = useSyncResource(resource);

  const classes = useStyles();
  const label = `${resource.namespace}/${resource.name}`;
  const title = isSyncing ? `Syncing ${label}` : `Sync ${label}`;

  return (
    <Tooltip title={title}>
      {/* <Progress /> can't handle forwardRef (?) so we wrap in a div */}
      <div>
        {isSyncing ? (
          <Progress data-testid="syncing" />
        ) : (
          <IconButton
            data-testid={`sync ${label}`}
            className={classes.syncButton}
            size="small"
            onClick={sync}
          >
            <RetryIcon />
          </IconButton>
        )}
      </div>
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
  } else if (condition?.status !== undefined) {
    color = '#FEF071';
  }

  return (
    <Tooltip title={condition?.message || ''}>
      <VerifiedUserIcon style={{ color, height: '16px' }} />
    </Tooltip>
  );
};

export const nameAndClusterName = ({
  resource,
}: {
  resource: HelmRelease | GitRepository | OCIRepository;
}): JSX.Element => (
  <Flex column>
    <NameLabel resource={resource} />
    <span>{resource.clusterName}</span>
  </Flex>
);

export const idColumn = () => {
  return {
    title: 'id',
    field: 'id',
    hidden: true,
  };
};

export const nameAndClusterNameColumn = () => {
  return {
    title: 'Name',
    render: (
      resource: HelmRelease | GitRepository | OCIRepository,
    ): React.ReactNode => nameAndClusterName({ resource }),
  };
};

export const verifiedColumn = () => {
  return {
    title: 'Verified',
    render: (resource: GitRepository | OCIRepository) => {
      return verifiedStatus({ resource });
    },
  };
};

export const urlColumn = () => {
  return {
    title: 'URL',
    render: (resource: GitRepository | OCIRepository) => {
      return <UrlWrapper title={resource.url}>{resource.url}</UrlWrapper>;
    },
    field: 'url',
    searchable: true,
  };
};

export const tagColumn = () => {
  return {
    title: 'URL',
    render: (resource: GitRepository | OCIRepository) => {
      return <span>{resource.artifact?.revision.split('@')[0]}</span>;
    },
    field: 'revision',
    searchable: true,
  };
};

export const statusColumn = () => {
  return {
    title: 'Status',
    render: (resource: GitRepository | OCIRepository | HelmRelease) => {
      return (
        <KubeStatusIndicator
          short
          conditions={resource.conditions}
          suspended={resource.suspended}
        />
      );
    },
  };
};

export const updatedColumn = () => {
  return {
    title: 'Updated',
    render: (resource: GitRepository | OCIRepository | HelmRelease) => {
      return DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      });
    },
  };
};

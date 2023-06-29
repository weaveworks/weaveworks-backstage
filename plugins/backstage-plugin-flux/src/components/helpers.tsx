import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { Tooltip } from '@material-ui/core';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { useWeaveFluxDeepLink } from '../hooks';
import {
  VerifiableSource,
  automationLastUpdated,
  findVerificationCondition,
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
  const style = { fontWeight: 600, marginBottom: '6px' };

  if (!deepLink) {
    return <span style={style}>{label}</span>;
  }

  return (
    <Link style={style} to={deepLink}>
      {label}
    </Link>
  );
};

export const Id = () => {
  return {
    title: 'id',
    field: 'id',
    hidden: true,
  };
};

export const VerifiedStatus = ({
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

export const NameAndClusterName = ({
  resource,
}: {
  resource: HelmRelease | GitRepository | OCIRepository;
}): JSX.Element => (
  <Flex column>
    <NameLabel resource={resource} />
    <span>{resource.clusterName}</span>
  </Flex>
);

export const NameAndClusterNameColumn = () => {
  return {
    title: 'Name',
    render: (
      resource: HelmRelease | GitRepository | OCIRepository,
    ): React.ReactNode => NameAndClusterName({ resource }),
  };
};

export const VerifiedColumn = () => {
  return {
    title: 'Verified',
    render: (resource: GitRepository | OCIRepository) => {
      return VerifiedStatus({ resource });
    },
  };
};

export const UrlColumn = () => {
  return {
    title: 'URL',
    render: (resource: GitRepository | OCIRepository) => {
      return <UrlWrapper title={resource.url}>{resource.url}</UrlWrapper>;
    },
    field: 'url',
    searchable: true,
  };
};

export const TagColumn = () => {
  return {
    title: 'URL',
    render: (resource: GitRepository | OCIRepository) => {
      return <span>{resource.artifact?.revision.split('@')[0]}</span>;
    },
    field: 'revision',
    searchable: true,
  };
};

export const StatusColumn = () => {
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

export const UpdatedColumn = () => {
  return {
    title: 'Updated',
    render: (resource: GitRepository | OCIRepository | HelmRelease) => {
      return DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      });
    },
  };
};

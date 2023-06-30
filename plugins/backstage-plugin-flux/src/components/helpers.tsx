import React from 'react';
import { Link } from '@backstage/core-components';
import { Tooltip } from '@material-ui/core';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { GitRepository, OCIRepository, useWeaveFluxDeepLink } from '../hooks';
import { VerifiableSource, findVerificationCondition } from './utils';
import { HelmRelease } from '../objects';

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

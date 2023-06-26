import React from 'react';
import { GitRepository, HelmRelease } from '@weaveworks/weave-gitops';
import { Link } from '@backstage/core-components';
import { OCIRepository, useWeaveFluxDeepLink } from '../hooks';

/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({ resource }: { resource: HelmRelease | GitRepository | OCIRepository }): JSX.Element => {
    const { name, namespace } = resource;
    const deepLink = useWeaveFluxDeepLink(resource);
    const label = `${namespace}/${name}`;

    if (!deepLink) {
        return <span>{label}</span>;
    }

    return <Link to={deepLink}>{label}</Link>;
};

import { makeStyles } from '@material-ui/core';

import { FluxObject } from '@weaveworks/weave-gitops';
import { OciRepository } from '../hooks';

/**
 * Find the timestamp of the first "Ready" condition.
 * @public
 */
export function automationLastUpdated(a: FluxObject): string {
  return (
    (a.conditions.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
};

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

/**
 * Returns true when the provided OciRepository has a verified condition and it's True.
 * @public
 */
export function isVerified(a: OciRepository): boolean {
  return (
    (a.conditions.find(condition => condition.type === 'SourceVerified') || {})
      .status === 'True'
  );
};
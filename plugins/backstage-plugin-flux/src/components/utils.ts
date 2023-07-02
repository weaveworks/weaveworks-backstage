import { makeStyles } from '@material-ui/core';
import { Condition, FluxObject } from '../objects';

/**
 * Find the timestamp of the first "Ready" condition.
 * @public
 */
export function automationLastUpdated(a: FluxObject): string {
  return (
    (a.conditions.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
}

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  nameLabel: {
    fontWeight: 600,
    // padding instead of margin to make sure bottoms of the "g" and "y"
    // chars are not cut off by the `overflow: hidden`
    paddingBottom: '5px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    direction: 'rtl',
    maxWidth: '350px',
  },
  syncButton: {
    padding: 0,
    margin: '-5px 0',
  },
}));

export interface VerifiableSource {
  isVerifiable(): boolean;
  conditions: Condition[];
}

/**
 * Returns the SourceVerified condition if any.
 * @public
 */
export const findVerificationCondition = (
  a: VerifiableSource,
): Condition | undefined =>
  a.conditions.find(condition => condition.type === 'SourceVerified');

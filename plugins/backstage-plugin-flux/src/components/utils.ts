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
  textOverflow: {
    // overflow hidden and white-space nowrap are needed for text-overflow to work
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    direction: 'rtl',
    maxWidth: '350px',
    height: '16px',
    marginTop: '2px',
  },
  nameLabel: {
    fontWeight: 600,
    marginBottom: '6px',
  },
  syncButton: {
    padding: 0,
    margin: '-5px 0',
  },
}));

export interface VerifiableSource {
  isVerifiable: boolean;
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

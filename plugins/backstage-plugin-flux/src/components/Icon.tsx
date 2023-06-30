import MuiCheckCircleIcon from '@material-ui/icons/CheckCircle';
import MuiRemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import MuiErrorIcon from '@material-ui/icons/Error';
import * as React from 'react';
import styled from 'styled-components';
import suspended from '../images/suspended.svg';
import reconcile from '../images/reconcile.svg';
import pendingAction from '../images/pending-action.svg';
// eslint-disable-next-line
import { colors, fontSizes, spacing } from '../typedefs/styled';
import Flex from './Flex';
import Text from './Text';

export enum IconType {
  ErrorIcon,
  CheckCircleIcon,
  RemoveCircleIcon,
  FailedIcon,
  SuspendedIcon,
  ReconcileIcon,
  PendingActionIcon,
}

type Props = {
  className?: string;
  type: IconType;
  color?: keyof typeof colors;
  text?: string;
  size: keyof typeof spacing;
  fontSize?: keyof typeof fontSizes;
};

function getIcon(i: IconType) {
  switch (i) {
    case IconType.CheckCircleIcon:
      return MuiCheckCircleIcon;

    case IconType.RemoveCircleIcon:
      return MuiRemoveCircleIcon;

    case IconType.FailedIcon:
      return MuiErrorIcon;

    case IconType.SuspendedIcon:
      return () => <img alt="suspended" src={suspended} />;

    case IconType.ReconcileIcon:
      return () => <img alt="reconcile" src={reconcile} />;

    case IconType.PendingActionIcon:
      return () => <img alt="pending" src={pendingAction} />;

    default:
      break;
  }

  return undefined;
}

function Icon({ className, type, text, color, fontSize }: Props) {
  return (
    <Flex align className={className}>
      {React.createElement(getIcon(type) || 'span')}
      {text && (
        <Text color={color} bold size={fontSize}>
          {text}
        </Text>
      )}
    </Flex>
  );
}

export default styled(Icon)`
  svg {
    fill: ${props => props.theme.colors[props.color as keyof typeof colors]};
    height: ${props => props.theme.spacing[props.size as keyof typeof spacing]};
    width: ${props => props.theme.spacing[props.size as keyof typeof spacing]};
    path,
    line,
    polygon,
    rect,
    circle,
    polyline {
      &.path-fill {
        fill: ${props =>
          props.theme.colors[props.color as keyof typeof colors]} !important;
        transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
      &.stroke-fill {
        stroke: ${props =>
          props.theme.colors[props.color as keyof typeof colors]} !important;
        transition: stroke 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
    }
    rect {
      &.rect-height {
        height: ${props =>
          props.theme.spacing[props.size as keyof typeof spacing]};
        width: ${props =>
          props.theme.spacing[props.size as keyof typeof spacing]};
      }
    }
  }
  &.downward {
    transform: rotate(180deg);
  }
  &.upward {
    transform: initial;
  }
  ${Text} {
    margin-left: 4px;
    color: ${props => props.theme.colors[props.color as keyof typeof colors]};
    font-size: ${props =>
      props.theme.fontSizes[props.fontSize as keyof typeof fontSizes]};
  }

  img {
    width: ${props => props.theme.spacing[props.size as keyof typeof spacing]};
  }
`;

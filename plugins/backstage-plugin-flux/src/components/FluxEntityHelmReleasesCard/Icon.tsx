import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import * as React from 'react';
import styled from 'styled-components';
import images from '../lib/images';
// eslint-disable-next-line
import { colors, fontSizes, spacing } from '../../typedefs/styled';
import Flex from './Flex';
import Text from './Text';

export enum IconType {
  CheckMark,
  Account,
  ExternalTab,
  AddIcon,
  ArrowUpwardIcon,
  ArrowDropDownIcon,
  ArrowDownwardRoundedIcon,
  ArrowUpwardRoundedIcon,
  KeyboardArrowRightIcon,
  KeyboardArrowDownIcon,
  DeleteIcon,
  SaveAltIcon,
  ErrorIcon,
  CheckCircleIcon,
  HourglassFullIcon,
  NavigateNextIcon,
  NavigateBeforeIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  RemoveCircleIcon,
  FilterIcon,
  ClearIcon,
  SearchIcon,
  LogoutIcon,
  SuccessIcon,
  FailedIcon,
  SuspendedIcon,
  FileCopyIcon,
  ReconcileIcon,
  FluxIcon,
  FluxIconHover,
  DocsIcon,
  ApplicationsIcon,
  PlayIcon,
  PauseIcon,
  NotificationsIcon,
  SourcesIcon,
  ImageAutomationIcon,
  DeliveryIcon,
  GitOpsRunIcon,
  PipelinesIcon,
  TerraformIcon,
  GitOpsSetsIcon,
  PoliciesIcon,
  PolicyConfigsIcon,
  WorkspacesIcon,
  SecretsIcon,
  TemplatesIcon,
  ClustersIcon,
  ExploreIcon,
  PendingActionIcon,
  CallReceived,
  CallMade,
  Remove,
  EditIcon,
  VerifiedUser,
  Policy,
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
      return CheckCircleIcon;

    case IconType.RemoveCircleIcon:
      return RemoveCircleIcon;

    case IconType.FailedIcon:
      return ErrorIcon;

    case IconType.SuspendedIcon:
      return () => <img src={images.suspendedSrc} />;

    case IconType.ReconcileIcon:
      return () => <img src={images.reconcileSrc} />;

    case IconType.PendingActionIcon:
      return () => <img src={images.pendingAction} />;

    default:
      break;
  }
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
    fill: ${props => props.theme.colors[props.color as any]};
    height: ${props => props.theme.spacing[props.size as any]};
    width: ${props => props.theme.spacing[props.size as any]};
    path,
    line,
    polygon,
    rect,
    circle,
    polyline {
      &.path-fill {
        fill: ${props => props.theme.colors[props.color as any]} !important;
        transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
      &.stroke-fill {
        stroke: ${props => props.theme.colors[props.color as any]} !important;
        transition: stroke 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
    }
    rect {
      &.rect-height {
        height: ${props => props.theme.spacing[props.size as any]};
        width: ${props => props.theme.spacing[props.size as any]};
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
    color: ${props => props.theme.colors[props.color as any]};
    font-size: ${props => props.theme.fontSizes[props.fontSize as any]};
  }

  img {
    width: ${props => props.theme.spacing[props.size as any]};
  }
`;

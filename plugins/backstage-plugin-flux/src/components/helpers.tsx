import React from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { Link, Progress, TableColumn } from '@backstage/core-components';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { useSyncResource, useWeaveFluxDeepLink } from '../hooks';
import {
  VerifiableSource,
  automationLastUpdated,
  findVerificationCondition,
  useStyles,
} from './utils';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
} from '../objects';
import Flex from './Flex';
import KubeStatusIndicator, { getIndicatorInfo } from './KubeStatusIndicator';

const helm = (
  <svg
    width="25px"
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 500"
  >
    <path
      fill="currentColor"
      d="M136.52938,121.13478c-.572-.54252-1.19462-1.12636-1.81-1.71761-12.61677-12.12115-22.38092-26.13637-28.279-42.702-1.65073-4.63637-2.89692-9.36515-2.67587-14.35871.021-.4739.01959-.94915.05226-1.42214.445-6.44594,4.75912-9.70322,11.05839-8.17669a27.325,27.325,0,0,1,5.73149,2.19653c6.89022,3.45538,12.5062,8.56359,17.67051,14.16571a112.52651,112.52651,0,0,1,21.722,33.42965,8.29635,8.29635,0,0,0,.38946.861c.07116.12855.22232.21282.55927.51883A176.357,176.357,0,0,1,241.968,79.06864c-.17651-.8761-.28195-1.54571-.44772-2.2a112.49436,112.49436,0,0,1-2.65292-36.95637,84.07478,84.07478,0,0,1,4.44444-21.76378,31.32555,31.32555,0,0,1,5.47651-10.17139,15.687,15.687,0,0,1,3.16336-2.82149,7.026,7.026,0,0,1,8.03255-.056,17.27854,17.27854,0,0,1,5.8402,6.73185A53.05435,53.05435,0,0,1,271.08657,26.508a112.50469,112.50469,0,0,1,2.12263,33.00356,95.59806,95.59806,0,0,1-3.49052,19.91081c7.12171,1.31193,14.20955,2.32869,21.1473,3.97713a186.37909,186.37909,0,0,1,20.44069,6.0033A188.31671,188.31671,0,0,1,331.0769,97.9721c6.34538,3.16433,12.38553,6.94066,18.71757,10.53829.20571-.433.50439-.94982.706-1.50212A108.65959,108.65959,0,0,1,383.40128,60.246a37.75787,37.75787,0,0,1,11.822-6.883,17.24558,17.24558,0,0,1,3.67827-.84512c6.264-.71729,8.89351,3.2244,9.35653,7.93183a29.94372,29.94372,0,0,1-.77381,10.35466A87.90551,87.90551,0,0,1,396.75426,95.492c-6.79016,10.97178-14.85015,20.85494-25.09307,28.83042-.30234.2354-.56784.51814-1.07988.99029a177.77993,177.77993,0,0,1,26.59293,30.88244,10.96227,10.96227,0,0,1-1.689.29762c-10.59546.015-21.1911-.01829-31.78622.04607a4.004,4.004,0,0,1-3.17246-1.69,147.87522,147.87522,0,0,0-88.17776-46.54846,143.35862,143.35862,0,0,0-30.27955-1.16923,146.40735,146.40735,0,0,0-82.53728,31.81054,140.06663,140.06663,0,0,0-16.97616,15.84186,4.72839,4.72839,0,0,1-3.86326,1.75742c-10.12056-.07028-20.24188-.035-30.36293-.03495h-2.15212c.618-2.408,6.84026-10.93786,13.88352-18.55281C125.31349,132.2744,130.87768,126.8839,136.52938,121.13478Z"
    />
    <path
      fill="currentColor"
      d="M394.52934,347.9123a176.63854,176.63854,0,0,1-23.97343,27.16338c.70941.59068,1.28594,1.07041,1.86212,1.55057A108.31456,108.31456,0,0,1,406.10131,424.772a34.61831,34.61831,0,0,1,2.202,14.42026,14.88544,14.88544,0,0,1-.74786,3.69206,7.20762,7.20762,0,0,1-8.15793,5.02308,22.23329,22.23329,0,0,1-6.76276-2.00629,51.23237,51.23237,0,0,1-9.18151-5.8151,107.59183,107.59183,0,0,1-32.936-46.7072c-.18746-.51334-.39218-1.0204-.72243-1.87691a194.65008,194.65008,0,0,1-25.01223,14.00774,181.66925,181.66925,0,0,1-26.6869,9.72442,187.55649,187.55649,0,0,1-28.3045,5.38805c.16807.84015.26446,1.5098.43745,2.15907a109.172,109.172,0,0,1,2.9708,36.44311,80.804,80.804,0,0,1-4.42286,22.4773,78.24971,78.24971,0,0,1-4.16475,8.74473,13.39,13.39,0,0,1-2.33865,2.97083c-3.98009,4.109-8.73225,4.144-12.61157-.07366a27.28012,27.28012,0,0,1-3.907-5.61776c-3.07685-5.77569-4.6604-12.056-5.791-18.46021a116.86329,116.86329,0,0,1-1.35893-26.465,94.4795,94.4795,0,0,1,2.88466-19.18513c.14009-.53269.268-1.0696.37134-1.61034.02629-.13754-.06342-.2973-.17067-.73825a176.12108,176.12108,0,0,1-80.96855-24.99386c-.40992.90921-.76206,1.67473-1.10168,2.44579a110.47729,110.47729,0,0,1-30.90112,41.42041,38.16071,38.16071,0,0,1-12.04706,6.95909,12.08987,12.08987,0,0,1-6.51516.70023,7.11858,7.11858,0,0,1-5.40329-4.4892c-1.41614-3.424-1.16526-6.985-.68438-10.51691a55.45267,55.45267,0,0,1,4.30768-14.25037A112.49985,112.49985,0,0,1,134.88761,380.779c.459-.43461.92981-.857,1.38087-1.29954a3.76029,3.76029,0,0,0,.36534-.65529,178.90466,178.90466,0,0,1-28.469-31.31672c.98458-.08018,1.64327-.18,2.30205-.1806,10.51436-.00976,21.029.02736,31.54284-.04358a4.70554,4.70554,0,0,1,3.70344,1.62615,146.94611,146.94611,0,0,0,39.40276,28.88494,139.94667,139.94667,0,0,0,49.70395,14.77367q70.68048,6.87067,121.59971-42.85452a7.64571,7.64571,0,0,1,5.99261-2.44347c9.80139.12121,19.60512.04986,29.408.04986h2.53353Z"
    />
    <path
      fill="currentColor"
      d="M350.73576,197.76167c2.78711,0,5.47037.18919,8.11487-.0501,2.9951-.271,5.139.8001,7.32354,2.81308,12.61275,11.62214,25.35732,23.10129,38.05863,34.62729.63855.57948,1.29039,1.14432,2.1101,1.8701.76445-.65718,1.48119-1.24318,2.16483-1.8655Q428.14636,217.27914,447.756,199.37a5.44772,5.44772,0,0,1,4.20358-1.64576c3.21888.13038,6.44673.03746,9.8412.03746V303.13036c-1.72309.50368-24.8756.60366-27.63911.0611v-53.362l-.53656-.25427c-9.01079,8.21784-18.0216,16.43564-27.23786,24.8408-9.22584-8.31119-18.34194-16.52347-27.458-24.73577l-.52449.19192c-.023,4.45359-.00774,8.90828-.01046,13.36233q-.00408,6.63942-.00058,13.27882v26.87211h-27.428C350.45161,301.61243,350.21289,203.72342,350.73576,197.76167Z"
    />
    <path
      fill="currentColor"
      d="M97.63436,197.88229h27.26325c.55054,1.75251.65821,102.97139.09469,105.525H97.70468c-.15021-6.70344-.04736-13.38394-.06622-20.06131-.01871-6.62261-.0041-13.24531-.0041-20.03958H63.84679V303.047c-2.05946.61518-25.33374.67417-27.64758.123V197.89436H63.73742v37.18876c1.96793.56844,30.92319.67339,33.872.12942.00818-2.97713.02-6.02646.024-9.0758q.0063-4.7433.00094-9.4866,0-4.625,0-9.25C97.63437,204.32179,97.63436,201.24346,97.63436,197.88229Z"
    />
    <path
      fill="currentColor"
      d="M157.5757,303.3683V198.1946c1.617-.52913,61.545-.73586,65.46219-.20457v22.41432c-.87869.063-1.7857.18341-2.69279.18454q-16.0086.01994-32.01725.00881l-2.96767,0v17.43353H218.7067V261.2229H185.65838c-.55339,1.98509-.70531,15.81681-.25622,19.64583.84488.05679,1.75.16952,2.6553.17059q16.00862.01863,32.01727.00822h2.96945V303.3683Z"
    />
    <path
      fill="currentColor"
      d="M254.28291,303.40855c-.50074-2.82232-.39948-103.60181.09747-105.51735h27.16208v77.76453c1.17173.06084,2.09122.14921,3.01077.15005q16.128.01468,32.2561.00658c.92562,0,1.85125,0,2.90733,0v27.59622Z"
    />
  </svg>
);
const kubernetes = (
  <svg
    width="25px"
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    viewBox="9.70 9.20 210.86 204.86"
  >
    <path
      fill="currentColor"
      d="M134.358 126.46551a3.59023 3.59023 0 0 0-.855-.065 3.68515 3.68515 0 0 0-1.425.37 3.725 3.725 0 0 0-1.803 4.825l-.026.037 8.528 20.603a43.53012 43.53012 0 0 0 17.595-22.102l-21.976-3.714zm-34.194 2.92a3.72 3.72 0 0 0-3.568-2.894 3.6556 3.6556 0 0 0-.733.065l-.037-.045-21.785 3.698a43.69506 43.69506 0 0 0 17.54 21.946l8.442-20.399-.066-.08a3.68318 3.68318 0 0 0 .207-2.291zm18.245 8a3.718 3.718 0 0 0-6.557.008h-.018l-10.713 19.372a43.637 43.637 0 0 0 23.815 1.225q2.197-.5 4.292-1.199l-10.738-19.407zm33.914-45l-16.483 14.753.009.047a3.725 3.725 0 0 0 1.46 6.395l.02.089 21.35 6.15a44.278 44.278 0 0 0-6.356-27.432zM121.7 94.0385a3.725 3.725 0 0 0 5.913 2.84l.065.028 18.036-12.789a43.85 43.85 0 0 0-25.287-12.19l1.253 22.105zm-19.1 2.922a3.72 3.72 0 0 0 5.904-2.85l.092-.044 1.253-22.139a44.68209 44.68209 0 0 0-4.501.775 43.4669 43.4669 0 0 0-20.937 11.409l18.154 12.869zm-9.678 16.728a3.72 3.72 0 0 0 1.462-6.396l.018-.087-16.574-14.825a43.454 43.454 0 0 0-6.168 27.511l21.245-6.13zm16.098 6.512l6.114 2.94 6.096-2.933 1.514-6.582-4.219-5.276h-6.79l-4.231 5.268z"
    />
    <path
      fill="currentColor"
      d="M216.208 133.16651l-17.422-75.675a13.60207 13.60207 0 0 0-7.293-9.073l-70.521-33.67a13.589 13.589 0 0 0-11.705 0l-70.507 33.688a13.598 13.598 0 0 0-7.295 9.072l-17.394 75.673a13.315 13.315 0 0 0-.004 5.81 13.50607 13.50607 0 0 0 .491 1.718 13.0998 13.0998 0 0 0 1.343 2.726c.239.365.491.72.765 1.064l48.804 60.678c.213.264.448.505.681.75a13.42334 13.42334 0 0 0 2.574 2.133 13.9237 13.9237 0 0 0 3.857 1.677 13.29785 13.29785 0 0 0 3.43.473h.759l77.504-.018a12.99345 12.99345 0 0 0 1.41-.083 13.46921 13.46921 0 0 0 1.989-.378 13.872 13.872 0 0 0 1.381-.442c.353-.135.705-.27 1.045-.433a13.94127 13.94127 0 0 0 1.479-.822 13.30347 13.30347 0 0 0 3.237-2.865l1.488-1.85 47.299-58.84a13.185 13.185 0 0 0 2.108-3.785 13.67036 13.67036 0 0 0 .5-1.724 13.28215 13.28215 0 0 0-.004-5.809zm-73.147 29.432a14.51575 14.51575 0 0 0 .703 1.703 3.314 3.314 0 0 0-.327 2.49 39.37244 39.37244 0 0 0 3.742 6.7 35.06044 35.06044 0 0 1 2.263 3.364c.17.315.392.803.553 1.136a4.24 4.24 0 1 1-7.63 3.607c-.161-.33-.385-.77-.522-1.082a35.27528 35.27528 0 0 1-1.225-3.868 39.3046 39.3046 0 0 0-2.896-7.097 3.335 3.335 0 0 0-2.154-1.307c-.135-.233-.635-1.149-.903-1.623a54.617 54.617 0 0 1-38.948-.1l-.955 1.731a3.429 3.429 0 0 0-1.819.886 29.51728 29.51728 0 0 0-3.268 7.582 34.89931 34.89931 0 0 1-1.218 3.868c-.135.31-.361.744-.522 1.073v.009l-.007.008a4.238 4.238 0 1 1-7.619-3.616c.159-.335.372-.82.54-1.135a35.17706 35.17706 0 0 1 2.262-3.373 41.22786 41.22786 0 0 0 3.82-6.866 4.18792 4.18792 0 0 0-.376-2.387l.768-1.84a54.922 54.922 0 0 1-24.338-30.387l-1.839.313a4.68007 4.68007 0 0 0-2.428-.855 39.52352 39.52352 0 0 0-7.356 2.165 35.58886 35.58886 0 0 1-3.787 1.45c-.305.084-.745.168-1.093.244-.028.01-.052.022-.08.029a.60518.60518 0 0 1-.065.006 4.236 4.236 0 1 1-1.874-8.224l.061-.015.037-.01c.353-.083.805-.2 1.127-.262a35.27 35.27 0 0 1 4.05-.326 39.38835 39.38835 0 0 0 7.564-1.242 5.83506 5.83506 0 0 0 1.814-1.83l1.767-.516a54.613 54.613 0 0 1 8.613-38.073l-1.353-1.206a4.688 4.688 0 0 0-.848-2.436 39.36558 39.36558 0 0 0-6.277-4.41 35.2503 35.2503 0 0 1-3.499-2.046c-.256-.191-.596-.478-.874-.704l-.063-.044a4.473 4.473 0 0 1-1.038-6.222 4.066 4.066 0 0 1 3.363-1.488 5.03 5.03 0 0 1 2.942 1.11c.287.225.68.526.935.745a35.25285 35.25285 0 0 1 2.78 2.95 39.38314 39.38314 0 0 0 5.69 5.142 3.333 3.333 0 0 0 2.507.243q.754.55 1.522 1.082a54.28892 54.28892 0 0 1 27.577-15.754 55.05181 55.05181 0 0 1 7.63-1.173l.1-1.784a4.6001 4.6001 0 0 0 1.37-2.184 39.47551 39.47551 0 0 0-.47-7.654 35.466 35.466 0 0 1-.576-4.014c-.011-.307.006-.731.01-1.081 0-.04-.01-.079-.01-.118a4.242 4.242 0 1 1 8.441-.004c0 .37.022.861.009 1.2a35.109 35.109 0 0 1-.579 4.013 39.53346 39.53346 0 0 0-.478 7.656 3.344 3.344 0 0 0 1.379 2.11c.015.305.065 1.323.102 1.884a55.309 55.309 0 0 1 35.032 16.927l1.606-1.147a4.6901 4.6901 0 0 0 2.56-.278 39.53152 39.53152 0 0 0 5.69-5.148 35.00382 35.00382 0 0 1 2.787-2.95c.259-.222.65-.52.936-.746a4.242 4.242 0 1 1 5.258 6.598c-.283.229-.657.548-.929.75a35.09523 35.09523 0 0 1-3.507 2.046 39.49476 39.49476 0 0 0-6.277 4.41 3.337 3.337 0 0 0-.792 2.39c-.235.216-1.06.947-1.497 1.343a54.837 54.837 0 0 1 8.792 37.983l1.704.496a4.7449 4.7449 0 0 0 1.82 1.831 39.46448 39.46448 0 0 0 7.568 1.245 35.64041 35.64041 0 0 1 4.046.324c.355.065.868.207 1.23.29a4.236 4.236 0 1 1-1.878 8.223l-.061-.008c-.028-.007-.054-.022-.083-.029-.348-.076-.785-.152-1.09-.232a35.1407 35.1407 0 0 1-3.785-1.462 39.47672 39.47672 0 0 0-7.363-2.165 3.337 3.337 0 0 0-2.362.877q-.9-.171-1.804-.316a54.91994 54.91994 0 0 1-24.328 30.605z"
    />
  </svg>
);

export type Source = GitRepository | OCIRepository | HelmRepository;
export type Deployment = HelmRelease | Kustomization;
/**
 * Calculate a Name label for a resource with the namespace/name and link to
 * this in Weave GitOps if possible.
 */
export const NameLabel = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => {
  const { name, namespace } = resource;
  const deepLink = useWeaveFluxDeepLink(resource);
  const label = `${namespace}/${name}`;
  const classes = useStyles();

  if (!deepLink) {
    return (
      <span className={classNames(classes.textOverflow, classes.nameLabel)}>
        {label}
      </span>
    );
  }

  return (
    <Link
      className={classNames(classes.textOverflow, classes.nameLabel)}
      to={deepLink}
    >
      {label}
    </Link>
  );
};

export const Url = ({ resource }: { resource: Source }): JSX.Element => {
  const classes = useStyles();
  return (
    <Tooltip title={resource.url}>
      <Box className={classes.textOverflow}>{resource.url}</Box>
    </Tooltip>
  );
};

export function SyncButton({ resource }: { resource: Source | Deployment }) {
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
            disabled={resource.suspended}
          >
            <RetryIcon />
          </IconButton>
        )}
      </div>
    </Tooltip>
  );
}

export function syncColumn<T extends Source | Deployment>() {
  return {
    title: 'Sync',
    render: row => <SyncButton resource={row} />,
    width: '24px',
  } as TableColumn<T>;
}

export const VerifiedStatus = ({
  resource,
}: {
  resource: VerifiableSource;
}): JSX.Element | null => {
  if (!resource.isVerifiable) return null;

  const condition = findVerificationCondition(resource);

  let color;
  if (condition?.status === 'True') {
    color = '#27AE60';
  } else if (condition?.status === 'False') {
    color = '#BC3B1D';
  } else if (!condition?.status) {
    color = '#FEF071';
  }

  return (
    <Tooltip title={condition?.message || 'pending verification'}>
      <VerifiedUserIcon style={{ color, height: '16px' }} />
    </Tooltip>
  );
};

export const nameAndClusterName = ({
  resource,
}: {
  resource: FluxObject;
}): JSX.Element => (
  <Flex column>
    <NameLabel resource={resource} />
    <span>cluster: {resource.clusterName}</span>
  </Flex>
);

export const idColumn = <T extends FluxObject>() => {
  return {
    title: 'id',
    field: 'id',
    hidden: true,
  } as TableColumn<T>;
};

export const nameAndClusterNameColumn = <T extends FluxObject>() => {
  return {
    title: 'Name',
    render: resource => nameAndClusterName({ resource }),
    ...sortAndFilterOptions(
      resource =>
        `${resource.namespace}/${resource.name}/${resource.clusterName}`,
    ),
  } as TableColumn<T>;
};

export const verifiedColumn = <T extends GitRepository | OCIRepository>() => {
  return {
    title: (
      <Tooltip title="Verification status">
        <VerifiedUserIcon style={{ height: '16px' }} />
      </Tooltip>
    ),
    render: resource => <VerifiedStatus resource={resource} />,
    ...sortAndFilterOptions(resource =>
      resource.isVerifiable
        ? findVerificationCondition(resource)?.status || 'unknown'
        : '',
    ),
    width: '90px',
  } as TableColumn<T>;
};

export const urlColumn = <T extends Source>() => {
  return {
    title: 'URL',
    field: 'url',
    render: resource => <Url resource={resource} />,
  } as TableColumn<T>;
};

export const artifactColumn = <T extends Source>() => {
  return {
    title: 'Artifact',
    render: resource => (
      <Tooltip
        title={resource.artifact?.revision.split('@')[1] || 'unknown tag'}
      >
        <span>{resource.artifact?.revision.split('@')[0]}</span>
      </Tooltip>
    ),
    ...sortAndFilterOptions(resource => resource.artifact?.revision),
  } as TableColumn<T>;
};

export const referenceColumn = <T extends Deployment>() => {
  const formatContent = (resource: Deployment) => {
    if (resource.type === 'HelmRelease') {
      return `${(resource as HelmRelease)?.helmChart?.chart}/${
        resource?.lastAppliedRevision
      }`;
    }
    return '';
  };

  return {
    title: 'Reference',
    render: (resource: Deployment) =>
      resource.type === 'HelmRelease' ? (
        formatContent(resource)
      ) : (
        <span>
          {resource.type === 'Kustomization'
            ? (resource as Kustomization)?.path
            : ''}
        </span>
      ),
    ...sortAndFilterOptions(resource =>
      resource.type === 'HelmRelease'
        ? formatContent(resource)
        : (resource as Kustomization)?.path,
    ),
  } as TableColumn<T>;
};

export const repoColumn = <T extends Deployment>() => {
  return {
    title: 'Repo',
    field: 'repo',
    render: resource => (
      <Tooltip title={resource.type || 'Unknown'}>
        <div>
          <Flex align>
            <div style={{ marginRight: '6px' }}>
              {resource.type === 'HelmRelease' ? helm : kubernetes}
            </div>
            <span>{resource?.sourceRef?.name}</span>
          </Flex>
        </div>
      </Tooltip>
    ),
  } as TableColumn<T>;
};

export const pathColumn = <T extends Kustomization>() => {
  return {
    title: 'Path',
    field: 'path',
    render: resource => <span>{resource?.path}</span>,
  } as TableColumn<T>;
};

export const chartColumn = <T extends HelmRelease>() => {
  const formatContent = (resource: HelmRelease) =>
    `${resource.helmChart.chart}/${resource.lastAppliedRevision}`;
  return {
    title: 'Chart',
    render: (resource: HelmRelease) => formatContent(resource),
    ...sortAndFilterOptions(resource => formatContent(resource)),
  } as TableColumn<T>;
};

export function statusColumn<T extends FluxObject>() {
  return {
    title: 'Status',
    render: resource => (
      <KubeStatusIndicator
        short
        conditions={resource.conditions}
        suspended={resource.suspended}
      />
    ),
    ...sortAndFilterOptions(
      resource =>
        getIndicatorInfo(resource.suspended, resource.conditions).type,
    ),
    minWidth: '130px',
  } as TableColumn<T>;
}

export const updatedColumn = <T extends FluxObject>() => {
  return {
    title: 'Updated',
    render: resource =>
      DateTime.fromISO(automationLastUpdated(resource)).toRelative({
        locale: 'en',
      }),
    ...sortAndFilterOptions(resource => automationLastUpdated(resource)),
    minWidth: '130px',
  } as TableColumn<T>;
};

//
// sorting and filtering helpers
//

export function sortAndFilterOptions<T extends object>(
  fn: (item: T) => string | undefined,
) {
  return {
    customFilterAndSearch: stringCompareFilter(fn),
    customSort: stringCompareSort(fn),
  } as TableColumn<T>;
}

export function stringCompareSort<T>(fn: (item: T) => string | undefined) {
  return (a: T, b: T) => {
    return (fn(a) || '').localeCompare(fn(b) || '');
  };
}

export function stringCompareFilter<T>(fn: (item: T) => string | undefined) {
  return (filter: any, item: T) => {
    return (fn(item) || '')
      .toLocaleLowerCase()
      .includes((filter as string).toLocaleLowerCase());
  };
}

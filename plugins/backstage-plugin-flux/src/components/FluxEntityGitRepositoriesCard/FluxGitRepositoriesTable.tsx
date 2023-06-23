import React from 'react';
import { GitRepository, KubeStatusIndicator } from '@weaveworks/weave-gitops';
import { Typography, makeStyles } from '@material-ui/core';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { automationLastUpdated } from '../utils';
import { DateTime } from 'luxon';
import { useWeaveFluxDeepLink } from '../../hooks';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const NameLabel = ({ gitRepository }: { gitRepository: GitRepository }) => {
  const { name, namespace } = gitRepository;
  const deepLink = useWeaveFluxDeepLink(gitRepository);
  const label = `${namespace}/${name}`;

  if (!deepLink) {
    return <span>{label}</span>;
  }

  return <Link to={deepLink}>{label}</Link>;
};

export const defaultColumns: TableColumn<GitRepository>[] = [
  {
    title: 'Name',
    render: (repo: GitRepository) => <NameLabel gitRepository={repo} />,
  },
  {
    title: 'URL',
    render: (repo: GitRepository) => {
      // TODO: This should figure out branch/sha from the Reference and format appropriately
      return `${repo.url}`;
    },
  },
  {
    title: 'Revision',
    render: (repo: GitRepository) => {
      // TODO This should pull from the status.artifact.revision
      return `${repo.reference.branch}`;
    },
  },
  {
    title: 'Cluster',
    render: (repo: GitRepository) => {
      return repo.clusterName;
    },
  },
  {
    title: 'Status',
    render: (repo: GitRepository) => {
      return (
        <KubeStatusIndicator
          short
          conditions={repo.conditions}
          suspended={repo.suspended}
        />
      );
    },
  },
  {
    title: 'Updated',
    render: (repo: GitRepository) => {
      return DateTime.fromISO(automationLastUpdated(repo)).toRelative({
        locale: 'en',
      });
    },
  },
];

type Props = {
  gitRepositories: GitRepository[];
  isLoading: boolean;
  columns: TableColumn<GitRepository>[];
};

export const FluxGitRepositoriesTable = ({
  gitRepositories,
  isLoading,
  columns,
}: Props) => {
  const classes = useStyles();

  const data = gitRepositories.map(repo => {
    return {
      id: `${repo.clusterName}/${repo.namespace}/${repo.name}`,
      conditions: repo.conditions,
      suspended: repo.suspended,
      name: repo.name,
      namespace: repo.namespace,
      url: repo.url,
      reference: repo.reference,
      clusterName: repo.clusterName,
      type: repo.type,
    } as GitRepository & { id: string };
  });

  return (
    <Table
      columns={columns}
      options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
      title="Git Repositories"
      data={data}
      isLoading={isLoading}
      emptyContent={
        <div className={classes.empty}>
          <Typography variant="body1">
            No Git Repositories found for this entity.
          </Typography>
        </div>
      }
    />
  );
};

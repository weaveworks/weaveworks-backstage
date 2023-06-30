import { Table, TableProps } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { isEqual } from 'lodash';
import React, { useMemo } from 'react';
import { useStyles } from './utils';

export function useDeepCompareMemoize(value: React.DependencyList) {
  const ref = React.useRef<React.DependencyList>([]);
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export function FluxEntityTable<T extends object = {}>({
  title,
  data,
  isLoading,
  columns,
}: TableProps<T>) {
  const classes = useStyles();

  return useMemo(() => {
    return (
      <Table
        columns={columns}
        options={{ padding: 'dense', paging: true, search: true, pageSize: 5 }}
        title={title}
        data={data}
        isLoading={isLoading}
        emptyContent={
          <div className={classes.empty}>
            <Typography variant="body1">
              No {title} found for this entity.
            </Typography>
          </div>
        }
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useDeepCompareMemoize([data, title, isLoading, classes.empty, columns]));
}

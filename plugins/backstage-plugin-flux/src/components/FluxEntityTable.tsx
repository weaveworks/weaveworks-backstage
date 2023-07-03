import { Table, TableProps } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useStyles } from './utils';
import { useDeepCompareMemo } from 'use-deep-compare';

export function FluxEntityTable<T extends object = {}>({
  title,
  data,
  isLoading,
  columns,
}: TableProps<T>) {
  const classes = useStyles();

  // We use this memo not really for performance, but to avoid
  // re-rendering the table when the data changes. Makes it much easier to style etc.
  // Review this decision if we run into hard to debug issues.
  //
  return useDeepCompareMemo(() => {
    return (
      <Table
        columns={columns}
        options={{
          padding: 'dense',
          paging: true,
          search: true,
          pageSize: 10,
          // Don't revert to "unsorted" on the 3rd click, just toggle between asc/desc
          thirdSortClick: false,
        }}
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
  }, [data, title, isLoading, classes.empty, columns]);
}

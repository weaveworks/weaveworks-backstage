import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 28,
  },
  path: {
    fill: '#7df3e1',
  },
  st0: {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    fill: '#32324B',
  },
  st1: {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    fill: '#00D2FF',
  },
  st2: {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    fill: '#FF4B19',
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 98.5 99.400002"
    >
      <path
         className={classes.st0}
         d="m 28.4,55.8 51,-45.3 C 75.3,7.3 70.8,4.8 65.9,3 L 28.4,36.3 Z M 13.8,49.3 0,61.6 c 1.3,5.1 3.3,9.9 6,14.2 l 7.8,-6.9 z"/>
      <path
         className={classes.st1}
         d="M 55.7,12.1 V 0.5 C 53.4,0.2 51,0 48.5,0 46,0 43.5,0.2 41,0.6 V 25.2 C 41.1,25.1 55.7,12.1 55.7,12.1 Z m 0,68.4 V 31.6 L 41,44.6 v 54.2 c 2.4,0.4 4.9,0.6 7.5,0.6 3,0 5.9,-0.3 8.7,-0.8 L 96.4,63.7 c 1.3,-4.5 2.1,-9.2 2.1,-14.1 0,-2.3 -0.2,-4.6 -0.5,-6.8 z"/>
      <path
         className={classes.st2}
         d="M 55.7,66.2 95,31.3 c -1.8,-4.7 -4.4,-9 -7.5,-12.8 L 55.7,46.7 Z M 41.1,59.6 28.5,70.8 V 4.1 C 23,6.5 18.1,9.8 13.8,13.9 v 71.5 c 3.3,3.2 7,5.9 11.1,8.1 L 41.1,79.2 c 0,0 0,-19.6 0,-19.6 z"/>
    </svg>
  );
};

export default LogoIcon;

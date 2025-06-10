import { createRef } from 'react';

export const navigationRef = createRef();

export const navigate = (name, params) => {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
};

export const replace = (name, params) => {
  if (navigationRef.current) {
    navigationRef.current.replace(name, params);
  }
};

export default {
  navigationRef,
  navigate,
  replace
}; 
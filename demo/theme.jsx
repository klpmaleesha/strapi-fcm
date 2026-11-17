import React from 'react';
import { DesignSystemProvider, lightTheme } from '@strapi/design-system';
import { MemoryRouter } from 'react-router-dom';
export default function Theme({ children }) {
  return <MemoryRouter><DesignSystemProvider theme={lightTheme}>{children}</DesignSystemProvider></MemoryRouter>;
}

import React from 'react';
import { Layout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
import { Typography } from '@strapi/design-system/Typography';

const gutter = { desktop: 10, tablet: 6, mobile: 4 };
export default function PageLayout({ title = 'Strapi FCM', subtitle, children }) {
  return <Layout>
    <Box as="header" paddingLeft={gutter} paddingRight={gutter} paddingTop={{ desktop: 8, mobile: 6 }} paddingBottom={{ desktop: 8, mobile: 6 }}>
      <Typography as="h1" variant="alpha" textColor="neutral800">{title}</Typography>
      {subtitle && <Box paddingTop={1}><Typography textColor="neutral600">{subtitle}</Typography></Box>}
    </Box>
    <Box paddingLeft={gutter} paddingRight={gutter}>{children}</Box>
  </Layout>;
}

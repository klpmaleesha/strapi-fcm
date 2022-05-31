import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";
import { Layout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { Flex } from "@strapi/design-system/Flex";
import { LinkButton } from "@strapi/design-system/LinkButton";

const GetStarted = () => {
  return (
    <Layout background="neutral100">
      <BaseHeaderLayout
        title="Get Started With Strapi FCM"
        subtitle="set up your firebase cloud messaging setup"
        as="h2"
      />
      <ContentLayout>
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={2}>
          <Box>
            <Box paddingBottom={4}>
              <Box paddingBottom={1}>
                <Typography variant="beta">Get Started 🎉</Typography>
              </Box>
              <Box>
                <Typography variant="pi" fontWeight="bold">
                  To get started with Strapi FCM, you need to set up your
                  firebase cloud messaging setup.
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box paddingBottom={2}>
                <Typography variant="body">1. Install the plugin</Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  2. Create a new project in your firebase console
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  3. Add your Firebase Admin SDK to Plugin Configuration
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  4. Create a Cloudinary account and add your credentials to
                  Plugin Configuration
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">5. You are good to go!</Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  6. Enjoy FCM notifications! 🎉
                </Typography>
              </Box>
            </Box>
            <Box paddingTop={4}>
              <Flex justifyContent="end">
                <LinkButton to="/settings/strapi-fcm" size="l">
                  Get Started
                </LinkButton>
              </Flex>
            </Box>
          </Box>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(GetStarted);

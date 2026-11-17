import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";
import { Layout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { Flex } from "@strapi/design-system/Flex";
import { LinkButton } from "@strapi/design-system/LinkButton";
import ChevronRight from "@strapi/icons/ChevronRight";
import { Link } from "@strapi/design-system/Link";

const GetStarted = () => {
  return (
    <Layout background="neutral100">
      <BaseHeaderLayout
        title="Get started with Strapi FCM"
        subtitle="Connect Firebase to start sending notifications"
        as="h2"
      />
      <ContentLayout>
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={8}>
          <Box>
            <Box paddingBottom={4}>
              <Box paddingBottom={1}>
                <Typography variant="alpha">Set up notifications</Typography>
              </Box>
              <Box>
                <Typography variant="pi" fontWeight="bold">
                  Connect your Firebase project and register your devices to
                  send your first notification.
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
                <Typography variant="body">3. Generate a Firebase service account JSON file</Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  4. Add your Firebase Admin SDK to Plugin Configuration
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  5. Optionally configure a Cloudinary cloud name and unsigned
                  preset for image uploads
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  6. Register frontend devices using the endpoint in the{" "}
                  <Link href="https://github.com/klpmaleesha/strapi-fcm">
                    Docs
                  </Link>
                </Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">7. You are good to go!</Typography>
              </Box>
              <Box paddingBottom={2}>
                <Typography variant="body">
                  8. Check acceptance and failure counts in the Sent tab
                </Typography>
              </Box>
            </Box>
            <Box paddingBottom={4} paddingTop={4}>
              <Typography variant="pi">
                To learn more about Strapi FCM and how to set up your firebase
                on your frontend and backend, see the{" "}
                <Link href="https://github.com/klpmaleesha/strapi-fcm">
                  Github
                </Link>{" "}
                documentation. For an example frontend and backend, see the{" "}
                <Link href="https://github.com/klpmaleesha/strapi-fcm-demo">
                  Github
                </Link>
              </Typography>
            </Box>
            <Box paddingTop={4}>
              <Flex justifyContent="end">
                <LinkButton
                  variant="secondary"
                  to="/settings/strapi-fcm"
                  size="l"
                  endIcon={<ChevronRight />}
                >
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

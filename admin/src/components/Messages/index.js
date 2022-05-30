import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import { Layout } from "@strapi/design-system/Layout";
import { Flex } from "@strapi/design-system/Flex";
import {
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system/Tabs";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";
import Send from "./Send";
import Sent from "./Sent";

const MessageForm = () => {
  return (
    <Layout background="neutral100">
      <BaseHeaderLayout
        title="Strapi FCM"
        subtitle="send firebase cloud messaging notifications"
        as="h2"
      />
      <ContentLayout
        shadow="filterShadow"
        hasRadius
        background="neutral0"
        padding={2}
      >
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={2}>
          <Layout>
            <Box>
              <TabGroup
                label="Some stuff for the label"
                id="tabs"
                variant="simple"
              >
                <Tabs>
                  <Tab>Send</Tab>
                  <Tab>Sent</Tab>
                </Tabs>
                <TabPanels paddingTop={4}>
                  <TabPanel>
                    <Send />
                  </TabPanel>
                  <TabPanel>
                    <Sent />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </Box>
          </Layout>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(MessageForm);
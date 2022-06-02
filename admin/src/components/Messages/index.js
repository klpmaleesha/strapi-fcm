import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Layout } from "@strapi/design-system/Layout";
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
      <ContentLayout>
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={2}>
          <Box>
            <TabGroup label="Some stuff for the label" id="tabs">
              <Tabs>
                <Tab>Send</Tab>
                <Tab>Sent</Tab>
              </Tabs>
              <Box padding={4}>
                <TabPanels>
                  <TabPanel>
                    <Send />
                  </TabPanel>
                  <TabPanel>
                    <Sent />
                  </TabPanel>
                </TabPanels>
              </Box>
            </TabGroup>
          </Box>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(MessageForm);

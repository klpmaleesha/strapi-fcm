import React, { memo } from "react";
import { Box } from "@strapi/design-system/Box";
import {
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system/Tabs";
import PageLayout from '../Common/PageLayout';
import Send from "./Send";
import Sent from "./Sent";

const MessageForm = () => {
  return (
    <PageLayout subtitle="Send Firebase Cloud Messaging notifications">
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={{ desktop: 8, mobile: 4 }}>
          <Box>
            <TabGroup label="Notifications" id="strapi-fcm-tabs">
              <Tabs>
                <Tab>Send</Tab>
                <Tab>Sent</Tab>
              </Tabs>
              <Box padding={{ desktop: 4, mobile: 2 }}>
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
    </PageLayout>
  );
};

export default memo(MessageForm);

import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import { Layout } from "@strapi/design-system/Layout";
import {
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system/Tabs";
import "../../styles/Message.css";
import Send from "./Send";

const MessageForm = () => {
  return (
    <Box padding={8} background="neutral100">
      <Layout>
        <Box className="header_container">
          <Typography variant="alpha">Send Notifications</Typography>
          <Typography variant="omega">
            Fill the feilds to send a message to all users
          </Typography>
        </Box>
      </Layout>
      <Box
        shadow
        className="configure_container"
        background="neutral0"
        padding={4}
      >
        <Layout>
          <Box padding={4} background="neutral0">
            <TabGroup
              label="Some stuff for the label"
              id="tabs"
              variant="simple"
            >
              <Tabs>
                <Tab>Send</Tab>
                <Tab>Sent</Tab>
              </Tabs>
              <TabPanels>
                <TabPanel>
                  <Box color="neutral800" padding={4} background="neutral0">
                    <Send />
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box color="neutral800" padding={4} background="neutral0">
                    Sent
                  </Box>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </Box>
        </Layout>
      </Box>
    </Box>
  );
};

export default memo(MessageForm);

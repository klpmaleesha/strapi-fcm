import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Divider } from "@strapi/design-system/Divider";
import { Typography } from "@strapi/design-system/Typography";
import { Checkbox } from "@strapi/design-system/Checkbox";
import { Button } from "@strapi/design-system/Button";
import { useCMEditViewDataManager, request } from "@strapi/helper-plugin";
import api from "../../api";

const sendPost = () => {
  const quary = useCMEditViewDataManager();

  const sendNotifications = () => {
    api
      .sendNotification({
        title: quary.modifiedData.Title,
        body: quary.modifiedData.Body,
      })
      .then((res) => {
        console.log(res);
      });
  };
  return (
    <Box>
      <Box padding={1}>
        <Divider />
        <Box paddingBottom={1} paddingTop={1}>
          <Box>
            <Typography variant="omega" fontWeight="bold">
              Send notification about new post
            </Typography>
          </Box>
          <Box paddingTop={1}>
            <Button variant="secondary" onClick={sendNotifications}>
              Send Notification
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(sendPost);

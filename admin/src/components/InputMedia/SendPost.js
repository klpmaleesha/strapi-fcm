import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Divider } from "@strapi/design-system/Divider";
import { Typography } from "@strapi/design-system/Typography";
import { Button } from "@strapi/design-system/Button";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import { useNotification } from "@strapi/helper-plugin";
import api from "../../api";

const sendPost = () => {
  const quary = useCMEditViewDataManager();
  const toggleNotification = useNotification();

  const sendNotifications = () => {
    api
      .sendNotification({
        title: quary.modifiedData.Title,
        body: quary.modifiedData.Body,
      })
      .then((res) => {
        toggleNotification({
          type: "success",
          message: "Notification sent successfully",
        });
      });
  };
  return (
    <Box>
      <Box padding={1}>
        <Divider />
        <Box paddingBottom={1} paddingTop={2}>
          <Box>
            <Typography variant="omega" fontWeight="bold">
              Strapi - FCM
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

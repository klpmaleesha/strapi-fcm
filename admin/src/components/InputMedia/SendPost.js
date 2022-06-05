import React, { memo, useState, useEffect } from "react";
import {
  Box,
  Divider,
  Button,
  Select,
  Option,
  Typography,
} from "@strapi/design-system";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import { useNotification } from "@strapi/helper-plugin";
import api from "../../api";

const sendPost = () => {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const [image, setImage] = useState();

  const {
    modifiedData,
    layout: { attributes },
  } = useCMEditViewDataManager();
  const toggleNotification = useNotification();

  const sendNotifications = () => {
    if (title === undefined || body === undefined) {
      toggleNotification({
        type: "warning",
        message: "Please fill all the fields",
      });
    } else {
      const payload = {
        title: modifiedData[title].toString(),
        body: modifiedData[body].toString(),
      };

      if (image)
        payload.image = `${process.env.STRAPI_ADMIN_BACKEND_URL}${modifiedData[image]?.url}`;

      api.sendNotification(payload).then(() => {
        toggleNotification({
          type: "success",
          message: "Notification sent successfully",
        });
      });
    }
  };
  return (
    <Box>
      <Box padding={4}>
        <Divider />
      </Box>
      <Typography variant="omega" fontWeight="bold">
        Strapi FCM
      </Typography>
      <Box paddingTop={2}>
        <Select
          placeholder="Field For Title"
          value={title}
          onChange={(e) => {
            setTitle(e);
          }}
        >
          {Object.keys(attributes).map((item, i) => (
            <Option key={i} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </Box>
      <Box paddingTop={2}>
        <Select
          placeholder="Field For Body"
          value={body}
          onChange={(e) => {
            setBody(e);
          }}
        >
          {Object.keys(attributes).map((item, i) => (
            <Option key={i} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <Box paddingTop={2}>
          <Select
            placeholder="Field For Image"
            value={image}
            onChange={(e) => {
              setImage(e);
            }}
          >
            {Object.keys(attributes).map((item, i) => (
              <Option key={i} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>
      <Box paddingTop={2}>
        <Button variant="secondary" onClick={sendNotifications}>
          Send Notification About New Post
        </Button>
      </Box>
    </Box>
  );
};

export default memo(sendPost);

import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import { Textarea } from "@strapi/design-system/Textarea";
import { Layout } from "@strapi/design-system/Layout";
import { TextInput } from "@strapi/design-system/TextInput";
import { Tooltip } from "@strapi/design-system/Tooltip";
import Information from "@strapi/icons/Information";
import "../../styles/Send.css";

const SendNotification = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <Box padding={4}>
      <Box>
        <Layout className="title_input_container">
          <Box padding={1}>
            <TextInput
              placeholder="Add a title"
              label="Title"
              name="title"
              hint="The title of the notification"
              error={title.length > 50 ? "title is too long" : undefined}
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              labelAction={
                <Tooltip description="Content of the tooltip">
                  <button
                    aria-label="info"
                    style={{
                      border: "none",
                      padding: 0,
                      background: "transparent",
                    }}
                  >
                    <Information aria-hidden={true} />
                  </button>
                </Tooltip>
              }
            />
          </Box>
          <Box padding={1}>
            <Textarea
              placeholder="Add a body"
              label="Body"
              name="body"
              hint="The body of the notification"
              error={
                body.length != 0 && body.length < 5
                  ? "Content is too short"
                  : undefined
              }
              onChange={(e) => setBody(e.target.value)}
              value={body}
              labelAction={
                <Tooltip description="Content of the tooltip" position="right">
                  <button
                    aria-label="Information about the email"
                    style={{
                      border: "none",
                      padding: 0,
                      background: "transparent",
                    }}
                  >
                    <Information aria-hidden={true} />
                  </button>
                </Tooltip>
              }
            />
          </Box>
        </Layout>
      </Box>
    </Box>
  );
};

export default memo(SendNotification);

import React, { memo, useState, useEffect, useRef } from "react";
import { Box } from "@strapi/design-system/Box";
import { Layout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { Button } from "@strapi/design-system/Button";
import { Link } from "@strapi/design-system/Link";
import Upload from "@strapi/icons/Upload";
import "../../styles/Home.css";

const Configure = () => {
  const filePickerRef = useRef();
  return (
    <Box className="configure_container" background="neutral0" padding={4}>
      <Layout>
        <Box className="header_container">
          <Typography variant="alpha">Welcome to FCM</Typography>
          <Typography variant="omega">
            Send clound message to all users with a few taps
          </Typography>
        </Box>
        <Box className="upload_container">
          <Button
            onClick={() => filePickerRef.current.click()}
            startIcon={<Upload />}
          >
            Upload Firebase Admin SDK
          </Button>
          <input
            type="file"
            hidden
            accept="application/json"
            ref={filePickerRef}
          />
          <Typography className="upload_description" variant="pi">
            Get the Firebase Admin SDK from the{" "}
            <Link href="https://firebase.google.com/docs/admin/setup">
              Firebase Console
            </Link>
            .
          </Typography>
        </Box>
        <Box className="next_container">
          <Button size="l">Next</Button>
        </Box>
      </Layout>
    </Box>
  );
};

export default memo(Configure);

import React, { memo, useState, useEffect, useRef } from "react";
import { Box } from "@strapi/design-system/Box";
import { Layout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { Button } from "@strapi/design-system/Button";
import { Link } from "@strapi/design-system/Link";
import Upload from "@strapi/icons/Upload";
import instance from "../../utils/axiosInstance";
import "../../styles/Home.css";

const Configure = ({ setActiveTab }) => {
  const [file, setFile] = useState(null);
  const filePickerRef = useRef();

  const uploadConfig = async () => {
    if (file) {
      const config = JSON.parse(await file.text());
      const {
        type,
        project_id,
        private_key_id,
        private_key,
        client_email,
        client_id,
        auth_uri,
        token_uri,
        auth_provider_x509_cert_url,
        client_x509_cert_url,
      } = config;
      if (
        type &&
        project_id &&
        private_key_id &&
        private_key &&
        client_email &&
        client_id &&
        auth_uri &&
        token_uri &&
        auth_provider_x509_cert_url &&
        client_x509_cert_url
      ) {
        const { data } = await instance.post("/upload", {
          config: await file.text(),
        });
        setActiveTab(1);
      } else {
        console.log("Invalid config");
      }
    } else {
      console.log("No file selected");
    }
  };

  return (
    <Box padding={8} background="neutral100">
      <Layout>
        <Box className="header_container">
          <Typography variant="alpha">Welcome to FCM</Typography>
          <Typography variant="omega">
            Send clound message to all users with a few taps
          </Typography>
        </Box>
      </Layout>
      <Box className="configure_container" background="neutral0" padding={4}>
        <Layout>
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
              onChange={(e) => setFile(e.target.files[0])}
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
            <Button
              disabled={file ? false : true}
              onClick={uploadConfig}
              size="l"
            >
              Next
            </Button>
          </Box>
        </Layout>
      </Box>
    </Box>
  );
};

export default memo(Configure);

import React, { memo, useState, useEffect, useRef } from "react";
import { Box } from "@strapi/design-system/Box";
import { Layout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { Button } from "@strapi/design-system/Button";
import { Link } from "@strapi/design-system/Link";
import Upload from "@strapi/icons/Upload";
import { Flex } from "@strapi/design-system/Flex";
import instance from "../../utils/axiosInstance";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";

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
    <Layout background="neutral100">
      <BaseHeaderLayout
        title="Strapi FCM"
        subtitle="send firebase cloud messaging notifications"
        as="h2"
      />
      <ContentLayout>
        <Box shadow="filterShadow" hasRadius background="neutral0" padding={2}>
          <Layout>
            <Box>
              <Flex
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Box>
                  <Flex alignItems="center" justifyContent="center">
                    <Button
                      onClick={() => filePickerRef.current.click()}
                      startIcon={<Upload />}
                    >
                      {!file ? "Upload Firebase Admin SDK" : "File selected"}
                    </Button>
                  </Flex>
                  <input
                    type="file"
                    hidden
                    accept="application/json"
                    onChange={(e) => setFile(e.target.files[0])}
                    ref={filePickerRef}
                  />
                  <Box width={15}>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      direction="column"
                    >
                      <Typography variant="pi">
                        Get the Firebase Admin SDK from the
                      </Typography>
                      <Link href="https://firebase.google.com/docs/admin/setup">
                        Firebase Console
                      </Link>
                    </Flex>
                  </Box>
                </Box>
              </Flex>
            </Box>

            <Flex justifyContent="end">
              <Button
                disabled={file ? false : true}
                onClick={uploadConfig}
                size="l"
              >
                Next
              </Button>
            </Flex>
          </Layout>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(Configure);

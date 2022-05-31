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
import { TextInput } from "@strapi/design-system/TextInput";
import { Tooltip } from "@strapi/design-system/Tooltip";
import Information from "@strapi/icons/Information";
import api from "../../api";

const Configure = () => {
  const [file, setFile] = useState(null);
  const [cloud, setCloud] = useState("");
  const [preset, setPreset] = useState("");
  const [error, setError] = useState(false);
  const [found, setFound] = useState(false);
  const [created, setCreated] = useState(false);
  const filePickerRef = useRef();

  useEffect(() => {
    api.getConfig().then((res) => {
      setCloud(res.cloud);
      setPreset(res.preset);
      setFile(res.sdk);
      setCreated(res.created);
    });
    instance.get("/sdk").then((res) => {
      if (res.data.message === "found") {
        setFound(true);
      }
    });
  }, []);


  const saveConfig = async () => {
    if (file && cloud && preset) {
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
        fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
          method: "POST",
          body: {
            upload_preset: preset,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data.error.message);
            if (data.error.message == "Unknown API key ") {
              setError(true);
            } else {
              setError(false);
            }
          });

        const { data } = await instance.post("/upload", {
          config: await file.text(),
        });
        try {
          const credentials = await api.setConfig({
            preset,
            cloud,
            created: true,
            sdk: config,
          });
        } catch (err) {
          console.log(err);
        }
        window.location.href = "/admin/plugins/strapi-fcm";
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
          <Box padding={4}>
            <Box paddingBottom={2}>
              <Typography variant="beta">Firebase Configuration</Typography>
              <Box paddingTop={2} paddingLeft={2}>
                <Button
                  onClick={() => filePickerRef.current.click()}
                  startIcon={<Upload />}
                >
                  {!created ? (
                    <>
                      {!file
                        ? "Upload Firebase Admin SDK"
                        : "Firebase Admin SDK Selected"}
                    </>
                  ) : (
                    <>
                      {file
                        ? "Chanage Firebase Admin SDK"
                        : "Firebase Admin SDK Selected"}
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  hidden
                  accept="application/json"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={filePickerRef}
                />
                <Box paddingTop={1}>
                  <Typography variant="pi">
                    To initialize firebase cloud messaging please upload your
                    admi SDK. Get the Firebase Admin SDK from the
                  </Typography>
                  <Link href="https://firebase.google.com/docs/admin/setup">
                    {" "}
                    Firebase Console
                  </Link>
                </Box>
              </Box>
            </Box>
            <Box paddingTop={2}>
              <Typography variant="beta">Cloudinary Configuration</Typography>
              <Box paddingTop={2} paddingLeft={2}>
                <Box padding={1}>
                  <TextInput
                    placeholder="Cloudinary Upload Preset"
                    label="Cloudinary Upload Preset"
                    name="cloudinaryUploadPreset"
                    hint="Enter your cloudinary upload preset"
                    error={error ? "invalid credentials" : null}
                    onChange={(e) => setPreset(e.target.value)}
                    value={preset}
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
                  <TextInput
                    placeholder="Cloudinary Cloud Name"
                    label="Cloudinary Cloud Name"
                    name="cloudinaryCloudName"
                    hint="Enter your cloudinary cloud name"
                    error={error ? "invalid credentials" : null}
                    onChange={(e) => setCloud(e.target.value)}
                    value={cloud}
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
                <Box paddingTop={1}>
                  <Typography variant="pi">
                    To send images to the users please upload your images to
                    cloudinary. Get the Cloudinary API Key from the
                  </Typography>
                  <Link href="https://cloudinary.com/console">
                    {" "}
                    Cloudinary Console
                  </Link>
                </Box>
              </Box>
            </Box>
            <Box paddingTop={2}>
              <Flex justifyContent="end">
                <Button
                  disabled={
                    file === null || cloud.length === 0 || preset.length === 0
                  }
                  onClick={saveConfig}
                  size="l"
                >
                  Save
                </Button>
              </Flex>
            </Box>
          </Box>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(Configure);

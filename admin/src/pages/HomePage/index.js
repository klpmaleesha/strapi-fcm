import React, { memo, useState, useEffect } from "react";
import pluginId from "../../pluginId";
import { Box } from "@strapi/design-system/Box";
import Configure from "../../components/Home/Configure";
import Loading from "../../components/Common/Loading";
import instance from "../../utils/axiosInstance";
import "../../styles/Home.css";
import Form from "../../components/Home/Interface/Form";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instance.get("/config").then((res) => {
      if (res.data.message === "found") {
        setActiveTab(1);
      }
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <Box padding={8} background="neutral100">
      {activeTab === 0 && <Configure setActiveTab={setActiveTab} />}
      {activeTab === 1 && <Form />}
    </Box>
  );
};

export default memo(HomePage);

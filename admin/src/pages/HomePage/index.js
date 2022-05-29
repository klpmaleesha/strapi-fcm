import React, { memo, useState, useEffect } from "react";
import pluginId from "../../pluginId";
import { Box } from "@strapi/design-system/Box";
import Configure from "../../components/Home/Configure";
import Loading from "../../components/Common/Loading";
import instance from "../../utils/axiosInstance";
import Messages from "../../components/Messages";

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
    <Box>
      {activeTab === 0 && <Configure setActiveTab={setActiveTab} />}
      {activeTab === 1 && <Messages />}
    </Box>
  );
};

export default memo(HomePage);

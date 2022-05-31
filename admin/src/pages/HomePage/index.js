import React, { memo, useState, useEffect } from "react";
import pluginId from "../../pluginId";
import { Box } from "@strapi/design-system/Box";
import Loading from "../../components/Common/Loading";
import instance from "../../utils/axiosInstance";
import Messages from "../../components/Messages";
import GetStarted from "../../components/Home/GetStarted";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState();
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
      {activeTab == 0 && <GetStarted />}
      {activeTab === 1 && <Messages />}
    </Box>
  );
};

export default memo(HomePage);

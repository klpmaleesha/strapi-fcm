import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import Messages from "../../components/Messages";
import GetStarted from "../../components/Home/GetStarted";
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import api from "../../api";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConfig().then((res) => {
      if (res.message === "found") {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingIndicatorPage />;
  }
  return (
    <Box>
      {activeTab == 0 && <GetStarted />}
      {activeTab === 1 && <Messages />}
    </Box>
  );
};

export default memo(HomePage);

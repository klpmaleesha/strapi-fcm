import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import Messages from "../../components/Messages";
import GetStarted from "../../components/Home/GetStarted";
import { LoadingIndicatorPage, useNotification } from "@strapi/helper-plugin";
import { errorMessage } from '../../utils/notifications';
import api from "../../api";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState();
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  useEffect(() => {
    api.getConfig().then((res) => {
      if (res.config.created) {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }
    }).catch((error) => {
      setActiveTab(0);
      notify({ type: 'warning', message: errorMessage(error) });
    }).finally(() => setLoading(false));
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

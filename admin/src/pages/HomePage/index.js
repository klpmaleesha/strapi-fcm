import React, { memo, useState, useEffect } from "react";
import pluginId from "../../pluginId";
import { Box } from "@strapi/design-system/Box";
import Configure from "../../components/Home/Configure";
import "../../styles/Home.css";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box padding={8} background="neutral100">
      {activeTab === 0 && <Configure />}
    </Box>
  );
};

export default memo(HomePage);

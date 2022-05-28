import React, { memo } from "react";
import { Box } from "@strapi/design-system/Box";
import { Loader } from "@strapi/design-system/Loader";
import "../../styles/Loader.css";

const Loading = () => {
  return (
    <Box className="loading_container" padding={8} background="neutral100">
      <Loader large />
    </Box>
  );
};

export default memo(Loading);

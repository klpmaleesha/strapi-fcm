import React, { memo } from "react";
import { Box } from "@strapi/design-system/Box";
import { Loader } from "@strapi/design-system/Loader";
import { Flex } from "@strapi/design-system/Flex";

const Loading = () => {
  return (
    <Box fullHeight>
      <Flex alignItems="center" justifyContent="center">
        <Box fullHeight padding={8} background="neutral0">
          <Loader>Loading notifications</Loader>
        </Box>
      </Flex>
    </Box>
  );
};

export default memo(Loading);

import React, { memo } from "react";
import { Box } from "@strapi/design-system/Box";
import { Loader } from "@strapi/design-system/Loader";
import { Flex } from "@strapi/design-system/Flex";

const Loading = () => {
  return (
    <Box fulleight>
      <Flex alignItems="center" justifyContent="center">
        <Box fullHeight padding={8} background="neutral100">
          <Loader large />
        </Box>
      </Flex>
    </Box>
  );
};

export default memo(Loading);

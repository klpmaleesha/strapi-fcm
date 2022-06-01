import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system/Table";
import instance from "../../utils/axiosInstance";
import api from "../../api";

const SentNotification = () => {
  useEffect(() => {
    api.sentNotifications().then((res) => {
      console.log(res);
    });
  }, []);
  return (
    <Box fullWidth>
      <Box padding={1}>
        <Table>
          <Thead>
            <Tr>
              <Th>Photo</Th>
              <Th>Title</Th>
              <Th>Body</Th>

              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Box>
                  <img src="" alt="" />
                </Box>
              </Td>
              <Td>
                <Box>
                  <strong>Title</strong>
                </Box>
              </Td>
              <Td>
                <Box>
                  <strong>Body</strong>
                </Box>
              </Td>

              <Td>
                <Box>
                  <strong>Date</strong>
                </Box>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default memo(SentNotification);

import React, { memo, useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
import api from "../../api";
import styled from "styled-components";
import Loading from "../Common/Loading";
import placeholderImage from "../../../public/placeholder-image.png";

const SentNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .sentNotifications()
      .then((res) => {
        setNotifications(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  if (loading) {
    return <Loading />;
  }
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
          {!notifications.length && (
            <Tbody padding={2}>
              <Tr>
                <Td>
                  <Box>
                    <Image src={placeholderImage} />
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Typography variant="pi">Title</Typography>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Typography variant="pi">Body</Typography>
                  </Box>
                </Td>

                <Td>
                  <Box>
                    <Typography variant="pi">Date</Typography>
                  </Box>
                </Td>
              </Tr>
            </Tbody>
          )}
          {notifications.map((notification) => (
            <Tbody padding={2}>
              <Tr>
                <Td>
                  <Box>
                    <Image
                      src={
                        notification.image
                          ? notification.image
                          : placeholderImage
                      }
                    />
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Typography variant="pi">{notification.title}</Typography>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Typography variant="pi">{notification.body}</Typography>
                  </Box>
                </Td>

                <Td>
                  <Box>
                    <Typography variant="pi">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Td>
              </Tr>
            </Tbody>
          ))}
        </Table>
      </Box>
    </Box>
  );
};

export default memo(SentNotification);

const Image = styled.img`
  height: 40px;
  width: 40px;
  object-fit: cover;
  border-radius: 50%;
`;

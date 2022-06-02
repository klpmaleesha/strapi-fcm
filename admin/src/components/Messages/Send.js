import React, { memo, useState, useRef, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Textarea } from "@strapi/design-system/Textarea";
import { TextInput } from "@strapi/design-system/TextInput";
import { Tooltip } from "@strapi/design-system/Tooltip";
import Information from "@strapi/icons/Information";
import { Button } from "@strapi/design-system/Button";
import { Flex } from "@strapi/design-system/Flex";
import {
  Card,
  CardBody,
  CardContent,
  CardBadge,
  CardTitle,
  CardSubtitle,
} from "@strapi/design-system/Card";
import Pencil from "@strapi/icons/Pencil";
import api from "../../api";
import { useNotification } from "@strapi/helper-plugin";

const SendNotification = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState("");
  const [cloud, setCloud] = useState("");
  const [preset, setPreset] = useState("");
  const toggleNotification = useNotification();

  const photoPickerRef = useRef();
  useEffect(() => {
    api.getConfig().then((res) => {
      setCloud(res.config.cloud);
      setPreset(res.config.preset);
    });
  }, []);

  const notify = () => {
    if (title.trim() && body.trim()) {
      if (photo) {
        const data = new FormData();
        data.append("file", photo);
        data.append("upload_preset", preset);
        fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
          method: "POST",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            api
              .sendNotification({ title, body, image: data.url })
              .then((res) => {
                setTitle("");
                setBody("");
                setPhoto(null);
              })
              .catch((err) => console.log(err));
          });
      } else {
        api
          .sendNotification({ title, body })
          .then((res) => {
            setTitle("");
            setBody("");
            setPhoto(null);
            toggleNotification({
              type: "success",
              message: "Notification sent successfully",
            });
          })
          .catch((err) =>
            toggleNotification({
              type: "error",
              message: "Error sending notification",
            })
          );
      }
    }
  };

  return (
    <Box fullWidth>
      <Box padding={1}>
        <TextInput
          placeholder="Add a title"
          label="Title"
          name="title"
          hint="The title of the notification"
          error={title.length > 50 ? "title is too long" : undefined}
          required
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          labelAction={
            <Tooltip description="Content of the tooltip">
              <button
                aria-label="info"
                style={{
                  border: "none",
                  padding: 0,
                  background: "transparent",
                }}
              >
                <Information aria-hidden={true} />
              </button>
            </Tooltip>
          }
        />
      </Box>
      <Box padding={1}>
        <Textarea
          placeholder="Add a body"
          label="Body"
          name="body"
          hint="The body of the notification"
          required
          error={
            body.length != 0 && body.length < 5
              ? "Content is too short"
              : undefined
          }
          onChange={(e) => setBody(e.target.value)}
          value={body}
          labelAction={
            <Tooltip description="Content of the tooltip">
              <button
                aria-label="Information about the email"
                style={{
                  border: "none",
                  padding: 0,
                  background: "transparent",
                }}
              >
                <Information aria-hidden={true} />
              </button>
            </Tooltip>
          }
        />
      </Box>
      <Box padding={1}>
        <Card
          style={{
            width: "240px",
          }}
          id="fourth"
        >
          <CardBody>
            <Box
              onClick={() => photoPickerRef.current.click()}
              padding={2}
              background="primary100"
            >
              <Pencil />
            </Box>
            <CardContent paddingLeft={2}>
              <CardTitle>{photo ? photo.name : "Image"}</CardTitle>
              <CardSubtitle>PNG/JPEG</CardSubtitle>
            </CardContent>
            <CardBadge>IMG</CardBadge>
          </CardBody>
          <input
            type="file"
            hidden
            accept="image/jpeg, image/png"
            onChange={(e) => setPhoto(e.target.files[0])}
            ref={photoPickerRef}
          />
        </Card>
      </Box>
      <Box>
        <Flex justifyContent="end">
          <Button
            type="submit"
            variant="primary"
            disabled={title.length === 0 || body.length === 0}
            onClick={notify}
          >
            Send
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default memo(SendNotification);

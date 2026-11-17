import React, { memo, useRef, useState } from 'react';
import { Box, Divider, Button, Select, Option, Typography } from '@strapi/design-system';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';
import api from '../../api';
import { deliveryNotice, errorMessage } from '../../utils/notifications';

const SendPost = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const { modifiedData, layout: { attributes } } = useCMEditViewDataManager();
  const notify = useNotification();
  const fields = Object.keys(attributes).filter((key) => ['string', 'text', 'richtext', 'email', 'enumeration'].includes(attributes[key].type));
  const images = Object.keys(attributes).filter((key) => attributes[key].type === 'media' && !attributes[key].multiple);
  const send = async () => {
    if (busy.current) return;
    busy.current = true; setSending(true);
    try {
      if (typeof modifiedData[title] !== 'string' || typeof modifiedData[body] !== 'string') throw new Error('Choose title and body fields containing text.');
      const payload = { title: modifiedData[title], body: modifiedData[body] };
      if (image) {
        const url = modifiedData[image]?.url;
        if (!url) throw new Error('The selected image field is empty.');
        payload.image = new URL(url, window.strapi?.backendURL || window.location.origin).href;
      }
      notify(deliveryNotice(await api.sendNotification(payload)));
    } catch (error) { notify({ type: 'warning', message: errorMessage(error) }); }
    finally { busy.current = false; setSending(false); }
  };
  return <Box>
    <Box padding={4}><Divider /></Box><Typography fontWeight="bold">Strapi FCM</Typography>
    <Box paddingTop={3}><Select label="Title field" value={title} onChange={setTitle}>{fields.map((key) => <Option key={key} value={key}>{key}</Option>)}</Select></Box>
    <Box paddingTop={3}><Select label="Body field" value={body} onChange={setBody}>{fields.map((key) => <Option key={key} value={key}>{key}</Option>)}</Select></Box>
    <Box paddingTop={3}><Select label="Image field (optional)" value={image} onChange={setImage}><Option value="">No image</Option>{images.map((key) => <Option key={key} value={key}>{key}</Option>)}</Select></Box>
    <Box paddingTop={3}><Button variant="secondary" loading={sending} disabled={!title || !body || sending} onClick={send}>Send notification about this post</Button></Box>
  </Box>;
};
export default memo(SendPost);

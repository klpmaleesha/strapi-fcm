import React, { memo, useEffect, useRef, useState } from 'react';
import { Box } from '@strapi/design-system/Box';
import { Textarea } from '@strapi/design-system/Textarea';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';
import { Flex } from '@strapi/design-system/Flex';
import { Select, Option } from '@strapi/design-system/Select';
import { Typography } from '@strapi/design-system/Typography';
import { useNotification } from '@strapi/helper-plugin';
import api from '../../api';
import { errorMessage, deliveryNotice } from '../../utils/notifications';
import { uploadImage } from '../../utils/uploadImage.mjs';

const SendNotification = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [config, setConfig] = useState({});
  const [target, setTarget] = useState('all');
  const [destination, setDestination] = useState('');
  const [data, setData] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const busy = useRef(false);
  const picker = useRef();
  const notify = useNotification();
  useEffect(() => {
    api.getConfig().then((res) => setConfig(res.config))
      .catch((error) => notify({ type: 'warning', message: errorMessage(error) }));
  }, []);
  const send = async (dryRun) => {
    if (busy.current) return;
    busy.current = true;
    setSending(true);
    try {
      const payload = { title, body, dryRun };
      if (data.trim()) {
        try { payload.data = JSON.parse(data); }
        catch { throw new Error('Custom data must be valid JSON with string values.'); }
      }
      if (target === 'topic') payload.topic = destination.trim();
      if (target === 'tokens') payload.tokens = destination.split(/[\s,]+/).filter(Boolean);
      if (target !== 'all' && !destination.trim()) throw new Error('Enter the target topic or device tokens.');
      if (image.trim()) payload.image = image.trim();
      if (photo) {
        if (dryRun) throw new Error('Use a direct image URL for a test send, or remove the selected file.');
        payload.image = await uploadImage({ file: photo, cloud: config.cloud, preset: config.preset });
        // Reuse the uploaded image if the subsequent Firebase request fails.
        setImage(payload.image); setPhoto(null);
        if (picker.current) picker.current.value = '';
      }
      const result = await api.sendNotification(payload);
      setLastResult(result);
      notify(deliveryNotice(result));
      // Preserve the form on partial failures so the result can be reviewed before another send.
      if (!dryRun && result.status === 'sent') {
        setTitle(''); setBody(''); setImage(''); setPhoto(null); setData('');
        if (picker.current) picker.current.value = '';
      }
    } catch (error) { notify({ type: 'warning', message: errorMessage(error) }); }
    finally { busy.current = false; setSending(false); }
  };
  const invalid = !title.trim() || !body.trim() || title.trim().length > 200 || body.trim().length > 2000 || sending;
  return <Box fullWidth>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 32, alignItems: 'start' }}>
    <div>
    <Box paddingBottom={5}><TextInput label="Title" name="title" placeholder="Add a title" required value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} hint={`${title.length}/200 characters`} /></Box>
    <Box paddingBottom={5}><Textarea label="Body" name="body" placeholder="Add a body" required value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} hint={`${body.length}/2000 characters`} /></Box>
    <Box paddingBottom={4}><Select label="Audience" value={target} onChange={(value) => { setTarget(value); setDestination(''); }}>
      <Option value="all">All registered devices</Option><Option value="tokens">Specific devices</Option><Option value="topic">Firebase topic</Option>
    </Select></Box>
    {target !== 'all' && <Box paddingBottom={4}><TextInput label={target === 'topic' ? 'Topic name' : 'Device tokens'} name="destination" value={destination} onChange={(e) => setDestination(e.target.value)} hint={target === 'topic' ? 'For example: product-updates. Devices must already be subscribed.' : 'Separate tokens with commas or spaces.'} /></Box>}
    <Box paddingBottom={4}><TextInput label="Image URL (optional)" name="image" value={image} placeholder="https://…" onChange={(e) => { setImage(e.target.value); setPhoto(null); if (picker.current) picker.current.value = ''; }} /></Box>
    {config.cloud && config.preset && <Box paddingBottom={4}>
      <Button variant="secondary" disabled={sending} onClick={() => picker.current.click()}>{photo ? photo.name : 'Upload an image instead'}</Button>
      {photo && <Button variant="tertiary" onClick={() => { setPhoto(null); if (picker.current) picker.current.value = ''; }}>Remove image</Button>}
      <input ref={picker} hidden type="file" accept="image/png,image/jpeg" onChange={(e) => { setPhoto(e.target.files[0] || null); setImage(''); }} />
    </Box>}
    <Box paddingBottom={5}><details><summary style={{ cursor: 'pointer', padding: '8px 0' }}><Typography variant="pi" fontWeight="bold">Advanced options</Typography></summary>
      <Box paddingTop={3}><Textarea label="Custom data (optional JSON)" name="data" value={data} placeholder={'{"screen":"updates"}'} onChange={(e) => setData(e.target.value)} hint="Keys and values must be strings." /></Box>
    </details></Box>
    </div>
    <Box background="neutral100" padding={{ desktop: 6, mobile: 4 }} hasRadius borderColor="neutral200" borderStyle="solid" borderWidth="1px">
      <Typography variant="delta" fontWeight="bold" textColor="neutral800">Notification preview</Typography>
      <Box paddingTop={2} paddingBottom={5}><Typography variant="pi" textColor="neutral600">See how your message reads before sending.</Typography></Box>
      <Box background="neutral0" padding={5} hasRadius borderColor="neutral200" borderStyle="solid" borderWidth="1px">
        <Box paddingBottom={3}><Typography variant="pi" textColor="neutral500">Your application · now</Typography></Box>
        <Box paddingBottom={2}><Typography fontWeight="bold" textColor="neutral800" style={{ overflowWrap: 'anywhere' }}>{title.trim() || 'Notification title'}</Typography></Box>
        <Typography textColor="neutral600" style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{body.trim() || 'Your notification message will appear here.'}</Typography>
        {(image || photo) && <Box paddingTop={3}><Typography variant="pi" textColor="primary600">Image attached</Typography></Box>}
      </Box>
      <Box paddingTop={4}><Typography variant="pi" textColor="neutral600">Appearance varies by device. Firebase acceptance does not guarantee delivery.</Typography></Box>
      {lastResult && <Box paddingTop={5}>
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">{lastResult.dryRun ? 'Last test result' : 'Last send result'}</Typography>
        <Box paddingTop={2}><Typography variant="pi" textColor="neutral600">{lastResult.response.successCount} accepted · {lastResult.response.failureCount} failed{lastResult.response.removedTokenCount > 0 ? ` · ${lastResult.response.removedTokenCount} expired tokens removed` : ''}</Typography></Box>
        {lastResult.response.failureCount > 0 && <Box paddingTop={2}><Typography variant="pi" textColor="warning700">Review the failures before sending again to avoid duplicate notifications.</Typography></Box>}
      </Box>}
    </Box>
    </div>
    <Box paddingTop={4} borderColor="neutral200" borderStyle="solid" borderWidth="1px 0 0">
      <Flex gap={3} justifyContent="space-between" wrap="wrap">
        <Typography variant="pi" textColor="neutral600">Test first to validate without delivering a notification.</Typography>
        <Flex gap={3} wrap="wrap"><Button variant="secondary" disabled={invalid} onClick={() => send(true)}>Test without sending</Button><Button disabled={invalid} loading={sending} onClick={() => send(false)}>Send</Button></Flex>
      </Flex>
    </Box>
  </Box>;
};
export default memo(SendNotification);

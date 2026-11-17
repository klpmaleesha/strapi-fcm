import React, { memo, useEffect, useRef, useState } from 'react';
import { Box } from '@strapi/design-system/Box';
import PageLayout from '../Common/PageLayout';
import { Typography } from '@strapi/design-system/Typography';
import { Button } from '@strapi/design-system/Button';
import { TextInput } from '@strapi/design-system/TextInput';
import { useNotification } from '@strapi/helper-plugin';
import api from '../../api';
import { errorMessage } from '../../utils/notifications';

const Configure = () => {
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({ cloud: '', preset: '', created: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const picker = useRef();
  const notify = useNotification();
  useEffect(() => {
    api.getConfig().then((res) => setConfig(res.config))
      .catch((error) => notify({ type: 'warning', message: errorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const input = { cloud: config.cloud, preset: config.preset };
      if (file) {
        if (file.size > 65536) throw new Error('Choose a service account JSON file smaller than 64 KB.');
        try { input.sdk = JSON.parse(await file.text()); }
        catch { throw new Error('The selected file is not valid JSON.'); }
      }
      const result = await api.setConfig(input);
      setConfig(result.config);
      setFile(null);
      if (picker.current) picker.current.value = '';
      notify({ type: 'success', message: 'Configuration saved. Private credentials stay on the server.' });
    } catch (error) { notify({ type: 'warning', message: errorMessage(error) }); }
    finally { setSaving(false); }
  };
  return <PageLayout subtitle="Firebase and optional image uploads">
    <Box background="neutral0" padding={{ desktop: 8, mobile: 4 }} hasRadius shadow="filterShadow">
      <Typography variant="beta">Firebase credentials</Typography>
      <Box paddingTop={4} paddingBottom={4}>
        <Typography>{config.managedCredentials ? 'Credentials are managed in the server configuration.' : config.created ? 'A service account is configured. Upload a new file to rotate it.' : 'Upload your Firebase service account JSON to get started.'}</Typography>
      </Box>
      {!config.managedCredentials && <Box paddingBottom={6}>
        <Button variant="secondary" disabled={loading || saving} onClick={() => picker.current.click()}>{file ? file.name : 'Choose service account JSON'}</Button>
        <input ref={picker} type="file" hidden accept="application/json,.json" onChange={(event) => setFile(event.target.files[0] || null)} />
      </Box>}
      <Typography variant="beta">Image uploads (optional)</Typography>
      <Box paddingTop={4} paddingBottom={4}><Typography>Use a restricted unsigned Cloudinary upload preset for images. Leave both fields empty for text notifications and direct image URLs.</Typography></Box>
      <Box paddingBottom={4}><TextInput label="Cloudinary cloud name" name="cloud" value={config.cloud} onChange={(e) => setConfig({ ...config, cloud: e.target.value })} /></Box>
      <Box paddingBottom={6}><TextInput label="Cloudinary upload preset" name="preset" value={config.preset} onChange={(e) => setConfig({ ...config, preset: e.target.value })} /></Box>
      <Button loading={saving} disabled={loading || saving || (!file && !config.created)} onClick={save}>Save configuration</Button>
    </Box>
  </PageLayout>;
};
export default memo(Configure);

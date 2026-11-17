import React, { memo, useEffect, useState } from 'react';
import { Box } from '@strapi/design-system/Box';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table';
import { Typography } from '@strapi/design-system/Typography';
import { Button } from '@strapi/design-system/Button';
import { Flex } from '@strapi/design-system/Flex';
import { Badge } from '@strapi/design-system/Badge';
import api from '../../api';
import Loading from '../Common/Loading';
import { errorMessage } from '../../utils/notifications';

const SentNotification = () => {
  const [result, setResult] = useState({ results: [], pagination: {} });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.sentNotifications({ page, pageSize: 10 })
      .then((data) => { if (active) setResult(data); })
      .catch((error) => { if (active) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, refresh]);
  if (loading) return <Loading />;
  return <Box fullWidth>
    <Flex justifyContent="space-between" paddingBottom={4}><Typography variant="beta">Notification history</Typography><Button variant="secondary" onClick={() => setRefresh(refresh + 1)}>Refresh</Button></Flex>
    {error ? <Typography role="alert">{error}</Typography> : <>
      {!result.results.length ? <Typography>No notifications yet. Send your first message to see results here.</Typography> :
      <Table><Thead><Tr><Th>Message</Th><Th>Audience</Th><Th>Status</Th><Th>Accepted / Failed</Th><Th>Date</Th></Tr></Thead>
        <Tbody>{result.results.map((item) => <Tr key={item.id}>
          <Td style={{ minWidth: 240, maxWidth: 360, whiteSpace: 'normal' }}><Typography fontWeight="bold" style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{item.title}</Typography><Box paddingTop={1}><Typography variant="pi" style={{ display: 'block', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{item.body}</Typography></Box></Td>
          <Td><Typography style={{ display: 'block', maxWidth: 180, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{item.target === 'topic' ? `Topic: ${item.topic}` : item.target === 'tokens' ? 'Specific devices' : 'All devices'}</Typography></Td>
          <Td><Badge background={item.status === 'sent' ? 'success100' : item.status === 'failed' ? 'danger100' : item.status === 'partial' ? 'warning100' : 'neutral100'} textColor={item.status === 'sent' ? 'success700' : item.status === 'failed' ? 'danger700' : item.status === 'partial' ? 'warning700' : 'neutral600'}>{({ sent: 'Accepted', partial: 'Partial', failed: 'Failed', sending: 'Sending', empty: 'No devices' })[item.status] || 'Legacy'}</Badge></Td>
          <Td><Typography>{item.successCount ?? '—'} / {item.failureCount ?? '—'}</Typography></Td>
          <Td><Typography>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</Typography></Td>
        </Tr>)}</Tbody>
      </Table>}
      <Flex gap={3} justifyContent="end" paddingTop={4}>
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Typography>Page {page} of {Math.max(1, result.pagination.pageCount || 0)}</Typography>
        <Button variant="secondary" disabled={page >= result.pagination.pageCount} onClick={() => setPage(page + 1)}>Next</Button>
      </Flex>
    </>}
  </Box>;
};
export default memo(SentNotification);

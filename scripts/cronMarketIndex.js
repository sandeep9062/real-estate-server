/**
 * scripts/cronMarketIndex.js
 *
 * Runs quarterly via node-cron.
 * Add to your server entry point:
 *   import './scripts/cronMarketIndex.js';
 *
 * Schedule: 2 AM on the 1st day of Jan, Apr, Jul, Oct
 */

import cron from 'node-cron';
import fetch from 'node-fetch';

const BASE_URL    = process.env.NEXT_PUBLIC_URL || 'http://localhost:5000';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// '0 2 1 1,4,7,10 *' = 02:00 on 1st of every quarter
cron.schedule('0 2 1 1,4,7,10 *', async () => {
  console.log('[cron] Generating quarterly Market Index...');
  try {
    const res = await fetch(`${BASE_URL}/api/market-index/generate`, {
      method:  'POST',
      headers: { 'x-admin-secret': ADMIN_SECRET },
    });
    const data = await res.json();
    console.log('[cron] Done:', data.message || data.error);
  } catch (err) {
    console.error('[cron] Failed:', err.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});

console.log('[cron] Market Index scheduler registered — runs quarterly at 02:00 IST');

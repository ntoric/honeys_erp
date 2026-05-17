
import { db } from './src/lib/db';

async function checkAudit() {
  const count = await db.auditLogs.count();
  console.log('Audit Logs Count:', count);
  const logs = await db.auditLogs.limit(5).toArray();
  console.log('Sample Logs:', JSON.stringify(logs, null, 2));
}

checkAudit();

import { loadConfig } from '../config/loader.js';

export default async function list() {
  const config = await loadConfig();

  const servers = Object.entries(config.servers);
  if (servers.length === 0) {
    process.stdout.write('No servers configured.\n');
    return;
  }

  // Object keyed by server name so console.table uses it as first column
  const rows = {};
  for (const [name, server] of servers) {
    rows[name] = {
      type: server.type,
      status: server.enabled ? '✅ enabled' : '❌ disabled',
      description: server.description || '-',
    };
  }

  console.table(rows, ['type', 'status', 'description']);
}

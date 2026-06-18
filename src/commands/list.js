import { loadConfig } from '../config/loader.js';

export default async function list() {
  const config = await loadConfig();

  const servers = Object.entries(config.servers);
  if (servers.length === 0) {
    process.stdout.write('No servers configured.\n');
    return;
  }

  // Compute column widths
  const nameColumn = 'NAME';
  const typeColumn = 'TYPE';
  const statusColumn = 'STATUS';
  const descColumn = 'DESCRIPTION';

  let maxNameWidth = nameColumn.length;
  let maxTypeWidth = typeColumn.length;
  let maxDescWidth = descColumn.length;

  for (const [name, server] of servers) {
    if (name.length > maxNameWidth) maxNameWidth = name.length;
    if (server.type.length > maxTypeWidth) maxTypeWidth = server.type.length;
    const desc = server.description || '-';
    if (desc.length > maxDescWidth) maxDescWidth = desc.length;
  }

  // Header
  const header = `${nameColumn.padEnd(maxNameWidth)}  ${typeColumn.padEnd(maxTypeWidth)}  ${statusColumn.padEnd(statusColumn.length)}  ${descColumn.padEnd(maxDescWidth)}`;
  process.stdout.write(header.trimEnd() + '\n');

  // Separator
  const sep = `${''.padEnd(maxNameWidth, '-')}  ${''.padEnd(maxTypeWidth, '-')}  ${''.padEnd(statusColumn.length, '-')}  ${''.padEnd(maxDescWidth, '-')}`;
  process.stdout.write(sep.trimEnd() + '\n');

  // Rows
  for (const [name, server] of servers) {
    const statusIcon = server.enabled ? '✅' : '❌';
    const statusText = server.enabled ? 'enabled' : 'disabled';
    const desc = server.description || '-';

    const row = `${name.padEnd(maxNameWidth)}  ${server.type.padEnd(maxTypeWidth)}  ${statusIcon} ${statusText} `.padEnd(maxNameWidth + 2 + maxTypeWidth + 2 + statusColumn.length, ' ') + ` ${desc}`;
    process.stdout.write(row.trimEnd() + '\n');
  }
}

import { loadConfig } from '../config/loader.js';
import { writeConfig } from '../config/writer.js';

export default async function disable(args) {
  const [serverName] = args;

  const config = await loadConfig();

  if (!config.servers[serverName]) {
    process.stderr.write(`Server '${serverName}' not found.\n`);
    process.exit(1);
  }

  config.servers[serverName].enabled = false;
  await writeConfig(config);

  process.stdout.write(`Server "${serverName}" disabled.\n`);
}

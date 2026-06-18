import { loadConfig } from '../config/loader.js';
import { writeConfig } from '../config/writer.js';
import { del as keychainDel } from '../keychain/index.js';

export default async function remove(args) {
  const [serverName] = args;

  const config = await loadConfig();

  if (!config.servers[serverName]) {
    process.stderr.write(`Server '${serverName}' not found.\n`);
    process.exit(1);
  }

  delete config.servers[serverName];
  await writeConfig(config);

  try {
    await keychainDel(serverName);
  } catch {
    // Ignore errors — the keychain entry may not exist
  }

  process.stdout.write(`Server "${serverName}" removed.\n`);
}

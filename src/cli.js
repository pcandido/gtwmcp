const HELP = `gmcp <command> [args]

Commands:
  gmcp add    <name>    Add or update an MCP server
  gmcp remove <name>    Remove an MCP server
  gmcp get    <name>    Show a server's configuration
  gmcp list             List all servers with status
  gmcp test   <name>    Test connection: authenticate, list tools
  gmcp enable <name>    Enable a server
  gmcp disable <name>   Disable a server
  gmcp serve            Start the MCP gateway in stdio mode
`;

function showHelp() {
  process.stdout.write(HELP);
}

export default async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const [subcommand, ...rest] = args;

  const subcommands = new Set(['add', 'remove', 'get', 'list', 'test', 'enable', 'disable', 'serve']);

  if (!subcommands.has(subcommand)) {
    showHelp();
    process.exit(1);
  }

  // serve and list don't take a server name arg
  if (subcommand === 'serve') {
    const { default: handler } = await import('./commands/serve.js');
    await handler();
    return;
  }
  if (subcommand === 'list') {
    const { default: handler } = await import('./commands/list.js');
    await handler();
    return;
  }

  // All other subcommands require a server name
  if (rest.length === 0) {
    showHelp();
    process.exit(1);
  }

  const { default: handler } = await import(`./commands/${subcommand}.js`);
  await handler(rest);
}

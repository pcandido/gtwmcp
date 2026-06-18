// serve command — start the MCP gateway in stdio mode
import { startGateway } from "../serve/gateway.js";

export default async function serveServer(args) {
  await startGateway();
}

import serverless from "serverless-http";
import { createServer } from "../server/index";

const app = createServer();

// Export handler for Vercel serverless functions
export const handler = serverless(app);

// Also export as default for Vercel compatibility
export default handler;

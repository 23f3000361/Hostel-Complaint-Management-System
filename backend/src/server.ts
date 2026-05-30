import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  // Intentional single startup log for local development.
  console.log(`Backend listening on http://localhost:${env.port}`);
});

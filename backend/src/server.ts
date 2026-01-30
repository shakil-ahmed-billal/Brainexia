import app from "./app";
import { env } from "./config/env";

const PORT = parseInt(env.PORT, 10) || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
});

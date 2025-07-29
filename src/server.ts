/* eslint-disable no-console */

import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.MONGODB_URI);
    if (envVars.NODE_ENV === "development") {
      console.log("connected to db");
    }

    server = app.listen(envVars.PORT, async () => {
      if (envVars.NODE_ENV === "development") {
        console.log(`server is listening on port ${envVars.PORT}`);
      }
    });
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      console.log(error);
    }
  }
};

(async () => {
  await startServer();

  await seedSuperAdmin();
})();

// *unhandled
process.on("unhandledRejection", (err) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Unhandled Rejection detected.. Server is shutting down", err);
  }
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
// *uncaugth
process.on("uncaughtException", (err) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Uncaugth Exception detected.. Server is shutting down", err);
  }
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("SIGTERM", () => {
  if (envVars.NODE_ENV === "development") {
    console.log("Sigterm signal received.. Server is shutting down");
  }
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
process.on("SIGINT", () => {
  if (envVars.NODE_ENV === "development") {
    console.log("Sigint signal received.. Server is shutting down");
  }
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

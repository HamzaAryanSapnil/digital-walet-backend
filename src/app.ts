import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import { globalErrorHandlers } from "./app/middlewares/global.error.handlers";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";

const app = express();

app.use(
  expressSession({
    secret: "Your Secret",
    saveUninitialized: false,
    resave: false,
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: [envVars.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({
    success: true,
    message: "Welcome to tour management system",
  });
});

app.use(globalErrorHandlers);
app.use(notFound);

export default app;

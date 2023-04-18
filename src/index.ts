import cors from "cors";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import { RegisterRoutes } from "../dist/routes";
dotenv.config();

import * as swaggerUI from "swagger-ui-express";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/docs", swaggerUI.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUI.generateHTML(await import("../dist/swagger.json")));
});
RegisterRoutes(app);

app.get("*", function (req, res) {
  res.json({
    error: "This is not a valid route",
  });
});
app.listen(process.env.PORT, () => {
  console.log(`Clinic Search App Listening on port ${process.env.PORT}`);
});

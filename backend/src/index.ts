import express from "express";
import { coursesRouter } from "./routes/courses";

const app = express();

app.use(express.json());

app.use("/", coursesRouter);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(3002, () => {
  console.log("Running on http://localhost:3002/");
});

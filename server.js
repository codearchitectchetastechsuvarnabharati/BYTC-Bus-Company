const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/solve", (req, res) => {
  const { subject, question } = req.body;
  const trimmedQuestion = typeof question === "string" ? question.trim() : "";
  const topic = trimmedQuestion.split("?")[0] || "your topic";

  res.json({
    title: `Guided ${subject || "Homework"} Solution`,
    summary: `We identified the core idea around ${topic.toLowerCase()}.`,
    steps: [
      "Highlight the keywords and known values.",
      "Pick the right formula or concept.",
      "Solve step by step and verify the result.",
    ],
    duration: "45 seconds",
  });
});

app.listen(port, () => {
  console.log(`Homework Solver running on http://localhost:${port}`);
});

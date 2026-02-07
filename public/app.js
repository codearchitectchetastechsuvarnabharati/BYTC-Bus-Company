const form = document.getElementById("solver-form");
const subjectSelect = document.getElementById("subject");
const questionInput = document.getElementById("question");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultTime = document.getElementById("result-time");

const formatSteps = (steps) => steps.map((step, index) => `${index + 1}. ${step}`).join(" ");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const subject = subjectSelect.value;
  const question = questionInput.value.trim();

  if (!question) {
    resultTitle.textContent = "Add a question to get started.";
    resultSummary.textContent = "Try typing or pasting a homework prompt.";
    resultTime.textContent = "Waiting for input";
    return;
  }

  resultTitle.textContent = "Thinking...";
  resultSummary.textContent = "Our tutors are drafting a guided solution.";
  resultTime.textContent = "Solving";

  try {
    const response = await fetch("/api/solve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, question }),
    });

    if (!response.ok) {
      throw new Error("Unable to solve right now.");
    }

    const data = await response.json();
    resultTitle.textContent = data.title;
    resultSummary.textContent = `${data.summary} ${formatSteps(data.steps)}`;
    resultTime.textContent = `Solved in ${data.duration}`;
  } catch (error) {
    resultTitle.textContent = "We hit a snag.";
    resultSummary.textContent = "Please try again in a moment.";
    resultTime.textContent = "Error";
  }
});

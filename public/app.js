const form = document.getElementById("solver-form");
const subjectSelect = document.getElementById("subject");
const questionInput = document.getElementById("question");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultTime = document.getElementById("result-time");
codex/create-homework-solver-website-co22gu
const signupForm = document.getElementById("signup-form");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupStatus = document.getElementById("signup-status");
const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginLdap = document.getElementById("login-ldap");
const loginStatus = document.getElementById("login-status");
=======
 main

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
codex/create-homework-solver-website-co22gu

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  signupStatus.textContent = "Creating account...";

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: signupName.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value.trim(),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to sign up.");
    }

    signupStatus.textContent = data.message;
    signupForm.reset();
  } catch (error) {
    signupStatus.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "Authenticating...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername.value.trim(),
        password: loginPassword.value.trim(),
        method: loginLdap.checked ? "ldap" : "local",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    loginStatus.textContent = data.message;
    loginForm.reset();
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});
=======
main

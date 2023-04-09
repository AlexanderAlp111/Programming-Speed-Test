// Elements
const codeSnippetSection = document.createElement("pre");
const menuContainer = document.getElementById("menu-container");
const languageSelect = document.getElementById("language");
const timerSelect = document.getElementById("timer");
const startTestBtn = document.getElementById("start-test");
let timeRemaining;

// Variables
const codeSnippets = {
  "C": [
    "https://gist.githubusercontent.com/AlexanderAlp111/3d1a14b00f12d624033706170085f8c9/raw/912e20895a5fd7fdf34360d1ba39a1458ecedb2f/hw_breakpoint_test.c",
    "https://gist.githubusercontent.com/AlexanderAlp111/c351c4588a7ea757c0400c4282fbf4a2/raw/b3a4421fa6d385379202ade16e728e440db1fdfe/flatten.c"
  ],
  "JavaScript": [
    "https://gist.githubusercontent.com/AlexanderAlp111/4f142014821d314139a287760d5268b3/raw/964f8d17a5f09c5d07277e195979c8aa0677d7d0/pathfindingAlgorithms.js",
    "https://gist.githubusercontent.com/AlexanderAlp111/1dfabea94715a7dfd318056a4ff0b51b/raw/ee17f40ba311deac7e61570358a5d08308e5de1d/shop.js"
  ]
};

function playTypingSound() {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.frequency.value = 1200; // Higher frequency for a more noticeable sound
  gainNode.gain.value = 0.05;
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.1);
}


// Functions
function populateLanguages() {
  Object.keys(codeSnippets).forEach(lang => {
    const option = document.createElement("option");
    option.value = lang;
    option.innerText = lang;
    languageSelect.appendChild(option);
  });
}

function populateTimers() {
  const timers = [5, 10, 15, 30, 45, 60];
  timers.forEach(timer => {
    const option = document.createElement("option");
    option.value = timer;
    option.innerText = `${timer} seconds`;
    timerSelect.appendChild(option);
  });
}

async function fetchCodeSnippet(language) {
  const urls = codeSnippets[language];
  const randomUrlIndex = Math.floor(Math.random() * urls.length);
  const url = urls[randomUrlIndex];

  try {
    const response = await fetch(url);
    if (response.ok) {
      const snippet = await response.text();
      return snippet;
    } else {
      throw new Error("Error fetching the code snippet");
    }
  } catch (error) {
    console.error(error);
  }
}

function startTest() {
  const language = languageSelect.value;
  const timer = timerSelect.value;
  fetchCodeSnippet(language).then((snippet) => {
    // Hide the menu
    menuContainer.style.display = "none";
    // Select a random starting point within the code snippet file
    const lines = snippet.split("\n");
    const randomIndex = Math.floor(Math.random() * Math.max(1, lines.length - 5));
    const selectedSnippet = lines.slice(randomIndex, randomIndex + 5).join("\n");
    // Create a timer display
    const timerDisplay = document.createElement("div");
    timerDisplay.id = "timer-display";
    timerDisplay.textContent = `${timer} seconds remaining`;
    document.body.appendChild(timerDisplay);
    // Create a new section to display the code snippet
    codeSnippetSection.id = "code-snippet";
    codeSnippetSection.textContent = selectedSnippet;
    document.body.appendChild(codeSnippetSection);
    // Create a new div for the dynamic input area
    const userInputArea = document.createElement("div");
    userInputArea.id = "user-input";
    document.body.appendChild(userInputArea);

    // Create a new div to display the next expected character
    const nextCharDisplay = document.createElement("div");
    nextCharDisplay.id = "next-char-display";
    document.body.appendChild(nextCharDisplay);

    // Update the next character display
    function updateNextCharDisplay(index) {
      const nextChar = userInputArea.children[index + 1]
        ? userInputArea.children[index + 1].dataset.expected
        : null;
      if (nextChar === " ") {
        nextCharDisplay.textContent = 'Next character: "SPACE"';
      } else if (nextChar !== null) {
        nextCharDisplay.textContent = `Next character: "${nextChar}"`;
      } else {
        nextCharDisplay.textContent = "Finished!";
      }
    }

    // Create individual character input boxes
    codeSnippetSection.textContent.split("").forEach((char, index) => {
      const inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.maxLength = 1;
      inputBox.size = 1;
      inputBox.dataset.index = index;
      inputBox.dataset.expected = char;
      inputBox.dataset.correct = "false";
      inputBox.addEventListener("input", (e) => {
        playTypingSound();
        if (e.target.value === e.target.dataset.expected) {
          e.target.style.backgroundColor = "green";
          e.target.dataset.correct = "true";
        } else {
          e.target.style.backgroundColor = "red";
          e.target.dataset.correct = "false";
        }

        // Automatically focus on the next input box
        const nextInputBox = userInputArea.children[index + 1];
        if (nextInputBox) {
          nextInputBox.focus();
        }

        // Update the next character display
        updateNextCharDisplay(index);
      });

      userInputArea.appendChild(inputBox);
    });

    userInputArea.firstChild.focus();
    updateNextCharDisplay(-1); // Initialize the next character display

    // Disable the "Start Test" button
    startTestBtn.disabled = true;
    // Start the timer
    timeRemaining = timer;
    const startTime = new Date();
    const timerInterval = setInterval(() => {
      // Check if the user has finished typing the code snippet
      const allDone = [...userInputArea.children].every(
        (input) => input.value.length > 0
      );

      if (allDone || timeRemaining <= 0) {
        // User has completed the snippet or timer has finished, stop the interval
        clearInterval(timerInterval);
        // Calculate typing speed and accuracy
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        const totalChars = userInputArea.children.length;
        const correctChars = [...userInputArea.children].filter(
          (input) => input.dataset.correct === "true"
          ).length;
          const incorrectChars = [...userInputArea.children].filter(
          (input) => input.dataset.correct === "false" && input.value !== ""
          ).length;
          const speed = Math.floor((correctChars / duration) * 60);
      // Display the results
     const userResponse = alert(
       `Results:\nCorrect characters: ${correctChars}\nIncorrect characters: ${incorrectChars}\nTyping speed: ${speed} characters per minute`
     );
     
     if (userResponse === undefined) {
       // Remove the timer, code snippet, user input elements, and next character display
       timerDisplay.remove();
       codeSnippetSection.remove();
       userInputArea.remove();
       nextCharDisplay.remove();
     
       // Re-enable the "Start Test" button and show the menu
       startTestBtn.disabled = false;
       menuContainer.style.display = "flex";
     }
     } else {
     timeRemaining--;
     timerDisplay.textContent = `${timeRemaining} seconds remaining`;
     }
   }, 1000);
  });
}

// Event Listeners
startTestBtn.addEventListener("click", startTest);

// Initialization
populateLanguages();
populateTimers();

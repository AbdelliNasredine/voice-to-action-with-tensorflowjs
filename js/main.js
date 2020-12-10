const startButton = document.querySelector(".vta__button");
const contentEl = document.querySelector(".vta__content");
const wordsListElement = document.querySelector(".vta__words");
const resultEl = document.querySelector(".vta__result");

let state = {
  isModelLoaded: false,
  recognizer: null,
  words: [],
};

function setLoading(status) {
  const loadingEl = document.querySelector(".vta__progress");
  return status
    ? loadingEl.classList.remove("vta-hidden")
    : loadingEl.classList.add("vta-hidden");
}

async function loadModel() {
  if (!state.isModelLoaded) {
    const recognizer = speechCommands.create("BROWSER_FFT");
    setLoading(true);
    await recognizer.ensureModelLoaded();
    setLoading(false);
    state = {
      isModelLoaded: true,
      recognizer: recognizer,
      words: recognizer.wordLabels(),
    };
    console.log(state);
  }
}

function startListening() {
  state.recognizer.listen(
    function ({ scores }) {
      scores = Array.from(scores).map((s, i) => ({
        score: s,
        word: state.words[i],
      }));
      console.log(scores);
      scores.sort((s1, s2) => s2.score - s1.score);
      console.log(`word is  = ${scores[0].word} , score = ${scores[0].score}`);
      resultEl.innerHTML = `<strong>${scores[0].word}</strong><br/><small>probability
       is ${scores[0].score}</small>`;
      setTimeout(function () {
        resultEl.innerHTML = "";
      }, 2000);
    },
    {
      probabilityThreshold: 0.8,
    }
  );
}

function stopListening() {
  if (state.recognizer) state.recognizer.stopListening();
}

function init() {
  // TODO LATER
}

startButton.addEventListener("click", async function ({ target }) {
  const status = target.dataset.status === "true";
  console.log(status);
  if (!status) {
    target.innerText = "stop recognizing";
    await loadModel();
    contentEl.classList.remove("vta-hidden");
    wordsListElement.innerHTML = "";
    resultEl.innerHTML = "";
    state.words.forEach(function (word) {
      wordsListElement.innerHTML += `<li id="${word}">${word}</li>`;
    });
    startListening();
  } else {
    stopListening();
    contentEl.classList.add("vta-hidden");
    target.innerText = "start recognizing";
  }
  target.dataset.status = !status;
});

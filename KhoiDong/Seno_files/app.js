const scoreEle = document.querySelector('header h1');
const timerEle = document.querySelector('footer h1');
const startBtn = document.querySelector('#startBtn');
const resetBtn = document.querySelector('#resetBtn');
const trueBtn = document.querySelector('#answerCorrect');
const falseBtn = document.querySelector('#answerFalse');
const initElement = document.querySelector('#initZone');
const gameElement = document.querySelector('#gameZone');
const resultElement = document.querySelector('#resultZone');

function* shuffle(array, strategy) {
  let calculateWeight;
  if (strategy === 'short') {
    calculateWeight = (word) => 1 / word.split(' ').length;
  } else if (strategy === 'long') {
    calculateWeight = (word) => word.split(' ').length;
  } else {
    calculateWeight = () => 1;
  }

  const arrayWithWeights = array.map((word) => ({
    word,
    weight: calculateWeight(word)
  }));
  let totalWeight = arrayWithWeights.reduce(
    (acc, { weight }) => acc + weight,
    0
  );
  while (arrayWithWeights.length) {
    const random = Math.random() * totalWeight;
    let current = 0;
    for (let i = 0; i < arrayWithWeights.length; i++) {
      current += arrayWithWeights[i].weight;
      if (random < current) {
        totalWeight -= arrayWithWeights[i].weight;
        yield arrayWithWeights.splice(i, 1)[0].word;
        break;
      }
    }
  }
}

class App {
  static start() {
    initElement.style.display = 'none';
    gameElement.style.display = 'block';
    resultElement.style.display = 'none';
    const time = document.querySelector('#time').value;
    this.GAMESTART = true;
    this.wordAll = [];
    this.wordTrue = [];
    this.wordFalse = [];
    
    // Get the selected word list based on the dropdown value
    const wordListType = document.querySelector('#wordList').value;
    const selectedWordList = wordListType === 'seno' ? seno : zenith;
    
    this.wordList = shuffle(
      [...selectedWordList],
      document.querySelector('#strategy').value
    );
    this.timer = time;
    this.timerInterval = setInterval(() => {
      this.timer -= 1;
      this.updateTimer();
      if (this.timer <= 0) {
        this.gameOver();
      }
    }, 1000);
    this.updateTimer();
    this.updateScore();
    this.next();
  }

  static reset() {
    initElement.style.display = 'flex';
    gameElement.style.display = 'none';
    resultElement.style.display = 'none';
    this.wordAll = [];
    this.wordTrue = [];
    this.wordFalse = [];
    this.timer = 0;
    this.updateTimer();
    this.updateScore();
    this.updateProgressBar();
  }

  static updateScore() {
    scoreEle.textContent = `${this.wordTrue.length}/${this.wordAll.length}`;
  }

  static updateTimer() {
    timerEle.textContent = `
    ${String(Math.floor(this.timer / 60)).padStart(2, '0')}
    :
    ${String(this.timer % 60).padStart(2, '0')}`;
  }

  static updateProgressBar() {
    const width =
      this.wordAll.length === 0
        ? 0
        : (this.wordTrue.length / this.wordAll.length) * 100;
    document.querySelector('header .progress-bar').style.width = `${width}%`;
  }

  static answer(mode, pushOnly = false) {
    const word = document.querySelector('#word').innerHTML;
    this[mode].push(word);
    this.wordAll.push(word);
    this.updateScore();
    this.updateProgressBar();
    if (pushOnly) {
      return;
    }
    if (!this.checkGame()) {
      return this.gameOver();
    } else {
      return this.next();
    }
  }

  static next() {
    const result = this.wordList.next().value;
    document.querySelector('#word').innerHTML = result;
    return result;
  }

  static checkGame() {
    const maxWord = document.querySelector('#maxWord').value;
    if (this.wordAll.length >= +maxWord) {
      return false;
    }
    return true;
  }

  static gameOver() {
    clearInterval(this.timerInterval);

    const word = document.querySelector('#word').innerHTML;
    if (!this.wordAll.includes(word)) {
      this.answer('wordFalse', true);
    }

    document.querySelector(
      '#resultZone h1'
    ).textContent = `Game Over! You got ${this.wordTrue.length} words correct!`;

    document.querySelector('#resultZone ol').innerHTML = this.wordAll
      .map(
        (word) =>
          `<li>${word} ${this.wordTrue.includes(word) ? '✅' : '❌'}</li>`
      )
      .join('\n');

    initElement.style.display = 'none';
    gameElement.style.display = 'none';
    resultElement.style.display = 'flex';
  }
}

startBtn.addEventListener('click', () => {
  App.start();
});

resetBtn.addEventListener('click', () => {
  App.reset();
});

// startBtn.addEventListener("touchstart", () => {
//   App.start();
// });

trueBtn.addEventListener('click', () => {
  App.answer('wordTrue');
});

falseBtn.addEventListener('click', () => {
  App.answer('wordFalse');
});

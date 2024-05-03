const letters = document.querySelectorAll('.letter');
const ANSWER_LENGTH = 5;
const messages = document.querySelector('.messages');

async function init() {
    async function getWordOfTheDay() {
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day");
            const data = await response.json();
            return data.word.toUpperCase();
        } catch (error) {
            console.error('Error fetching word of the day:', error);
            throw error;
        }
    }

    const WordOfTheDay = await getWordOfTheDay();

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    let currentGuess = '';
    let currentCell = 0;
    let editable = true;
    let wordValid = false;

    function inputLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
            letters[currentCell].innerText = letter;
            document.getElementById("" + currentCell).classList.add("typed");
            addRmCurrentLetter();
        }
    }
    letters.forEach(letter => {
        letter.addEventListener('touchstart', function(e) {
            e.preventDefault();
            inputLetter(this.innerText);
        });
    });

    function addRmCurrentLetter() {
        console.log(currentCell);
        document.getElementById("" + currentCell).classList.remove("current-letter");{
        currentCell++;
        if (currentCell < 30) {
        document.getElementById("" + currentCell).classList.add("current-letter");}
    }
    }

    async function toggleLoader(toggle) {
        if (toggle == 'on') {
            document.querySelector('.loader').style.visibility = 'visible';
        } else {
            document.querySelector('.loader').style.visibility = 'hidden';
        }
    }

    function showMessage(message) {
        messages.innerText = message;
        messages.classList.add('show');
        if (message.includes("GAME OVER")) {
            return;
        }
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }

    function hideMessage() {
        messages.classList.remove('show');
    }

    function win() {
        showMessage("YOU WIN");
        document.querySelector(".title").classList.add("win");
    }

    function lose() {
        showMessage("GAME OVER, the word was:" + WordOfTheDay);
    }

    function backspace() {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1);
            letters[currentCell - 1].innerText = '';
            if (currentCell < 30) {
                document.getElementById("" + currentCell).classList.remove("current-letter");
            }
            currentCell--;
            document.getElementById("" + currentCell).classList.add("current-letter");
        }
    }

    async function enter() {
        toggleLoader('on');
        await checkIfWord();
        toggleLoader('off');
        if (wordValid) {
            compareLetters(currentGuess, WordOfTheDay);
            if (currentGuess === WordOfTheDay) {
                win();
            } else {
                if (currentCell >= 30) {
                    lose();
                    editable = false;
                    return;
                }
                currentGuess = "";
                wordValid = false;
            }
        }
    }

    async function checkIfWord() {
        if (currentGuess.length === ANSWER_LENGTH) {
            editable = false;
            try {
                const response = await fetch("https://words.dev-apis.com/validate-word", {
                    method: "POST",
                    body: JSON.stringify({
                        word: currentGuess,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const json = await response.json();
                wordValid = json.validWord;
                wordValid ? wordValid : showMessage("Not on a word list");
            } catch (error) {
                wordValid = false;
            } finally {
                editable = true;
            }
        } else {
            showMessage("not enough letters");
            wordValid = false;
            editable = true;
        }
    }

    function countLetter(array) {
        const obj = {};
        for (let i = 0; i < array.length; i++) {
            if (obj[array[i]]) {
                obj[array[i]]++;
            } else {
                obj[array[i]] = 1;
            }
        }
        return obj;
    }

    function compareLetters(currentGuess, WordOfTheDay) {
        let CurrentGuessArray = currentGuess.slice(0, ANSWER_LENGTH);
        const WoTDMap = countLetter(WordOfTheDay);
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (CurrentGuessArray[i] == WordOfTheDay[i]) {
                document.getElementById(currentCell - 5 + i).classList.add("correct");
                WoTDMap[CurrentGuessArray[i]]--;
            }
        }
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (CurrentGuessArray[i] === WordOfTheDay[i]) {
            } else if (WoTDMap[CurrentGuessArray[i]] > 0) {
                letters[currentCell - 5 + i].classList.add("close");
                WoTDMap[CurrentGuessArray[i]]--;
            } else {
                letters[currentCell - 5 + i].classList.add("wrong");
            }
        }
    }

    document.addEventListener('keydown', function handlekeypress(event) {
        if (!editable) return;
        const action = event.key;
        if (action === 'Enter') {
            enter();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            inputLetter(action.toUpperCase());
        }
    });
}
init();

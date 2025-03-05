document.addEventListener('DOMContentLoaded', function() {
    // Load JSON data for keywords and questions
    Promise.all([
        fetch('keywords.json').then(response => response.json()),
        fetch('questions.json').then(response => response.json())
    ])
    .then(([keywordsData, questionsData]) => {
        // Process JSON data
        const keywords = keywordsData.keywords || [];
        const questionsPool = questionsData.questions || [];
        
        // Initialize the game with JSON data
        initializeGame(keywords, questionsPool);
    })
    .catch(error => {
        console.error('Error loading JSON data:', error);
        // Fallback to older JS files if JSON loading fails
        console.log('Falling back to JavaScript files...');
        loadScripts(['images.js', 'keywords.js', 'questions.js', 'answers.js', 'hints.js'], initializeGameLegacy);
    });
    
    // Legacy script loading function (fallback)
    function loadScripts(scripts, callback) {
        let loadedCount = 0;
        
        scripts.forEach(script => {
            const scriptElement = document.createElement('script');
            scriptElement.src = script;
            document.head.appendChild(scriptElement);
            
            scriptElement.onload = function() {
                loadedCount++;
                if (loadedCount === scripts.length) {
                    callback();
                }
            };
        });
    }
    
    // Legacy game initialization (fallback)
    function initializeGameLegacy() {
        const randomIndex = Math.floor(Math.random() * images.length);
        const mainImage = document.getElementById('mainImage');
        mainImage.src = 'assets/' + images[randomIndex];
        setupOverlay(mainImage);
        setupQuestionsList(randomIndex);
        addModalStyles();
        setupKeywordChecking(randomIndex);
    }
    
    // New JSON-based game initialization
    function initializeGame(keywords, questionsPool) {
        // Select random keyword
        const randomKeywordIndex = Math.floor(Math.random() * keywords.length);
        const selectedKeywordObj = keywords[randomKeywordIndex];
        
        // Get data from selected keyword
        const keyword = selectedKeywordObj.keyword || "DEFAULT";
        const imagePath = selectedKeywordObj.imageDir || "image.png";
        const clues = selectedKeywordObj.clues || [];
        
        // Shuffle and select random questions from the pool
        const shuffledQuestions = shuffleArray(questionsPool);
        const selectedQuestions = shuffledQuestions.slice(0, 12); // Get 12 random questions
        
        console.log(`Selected keyword: ${keyword}, Image: ${imagePath}`);
        console.log('Selected 12 random questions');
        
        // Load selected image
        const mainImage = document.getElementById('mainImage');
        mainImage.src = 'assets/' + imagePath;
        
        // Setup overlay with grid
        setupOverlay(mainImage);
        
        // Setup questions list
        setupQuestionsListJSON(selectedQuestions, clues);
        
        // Add modal styles
        addModalStyles();
        
        // Setup keyword checking
        setupKeywordCheckingJSON(keyword);
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    function setupOverlay(mainImage) {
        const overlay = document.getElementById('overlay');
        
        // Clear existing boxes in case of restart
        overlay.innerHTML = '';
        
        // Update overlay size when image loads
        function updateOverlaySize() {
            const imageWidth = mainImage.offsetWidth;
            const imageHeight = mainImage.offsetHeight;
            overlay.style.width = imageWidth + 'px';
            overlay.style.height = imageHeight + 'px';
        }
        
        // Update overlay size when image loads
        mainImage.onload = function() {
            updateOverlaySize();
            
            // Create grid boxes after image size is known
            createGridBoxes(overlay);
        };
        
        // Update overlay size when window is resized
        window.addEventListener('resize', updateOverlaySize);
    }
    
    function createGridBoxes(overlay) {
        const numBoxes = 12; // Using 12 boxes for the grid
        
        for (let i = 1; i <= numBoxes; i++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.id = 'box' + i;
            box.textContent = i;
            overlay.appendChild(box);
        }
    }
    
    function setupQuestionsListJSON(questions, clues) {
        const questionList = document.getElementById('list');
        
        // Clear existing questions in case of restart
        questionList.innerHTML = '';
        
        // Display 12 questions
        for (let i = 0; i < 12; i++) {
            const questionData = questions[i];
            const questionDiv = document.createElement('button');
            questionDiv.className = 'question';
            questionDiv.textContent = 'Question ' + (i + 1);
            questionDiv.id = 'question' + (i + 1);
            
            questionDiv.addEventListener('click', function() {
                showQuestionModal(questionData, i, clues);
            });
            
            questionList.appendChild(questionDiv);
        }
    }
    
    function showQuestionModal(questionData, questionIndex, clues) {
        const questionText = questionData.question;
        const correctAnswer = questionData.answer;
        const clue = clues[questionIndex] || "Clue" + (questionIndex + 1);
        
        // Print debug info to console
        console.log('Question:', questionText);
        console.log('Answer:', correctAnswer);
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('questionModal');
        if (modal) {
            document.body.removeChild(modal);
        }
        
        modal = document.createElement('div');
        modal.id = 'questionModal';
        modal.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Add question text
        const questionElement = document.createElement('p');
        questionElement.textContent = questionText;
        questionElement.className = 'question-text';
        modalContent.appendChild(questionElement);
        
        // Add answer character count hint
        const answerLengthHint = document.createElement('div');
        answerLengthHint.className = 'answer-length-hint';
        answerLengthHint.textContent = `Hint: The answer has ${correctAnswer.length} characters`;
        modalContent.appendChild(answerLengthHint);
        
        // Add answer input
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.id = 'answerInput';
        answerInput.placeholder = `Type your answer here...`;
        answerInput.className = 'answer-input';
        answerInput.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
        modalContent.appendChild(answerInput);
        
        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.className = 'submit-btn';
        submitButton.addEventListener('click', function() {
            checkAnswerJSON(questionIndex, correctAnswer, clue);
        });
        modalContent.appendChild(submitButton);
        
        // Add close button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'close-btn';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        modalContent.appendChild(closeButton);
        
        // Handle Enter key in input
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswerJSON(questionIndex, correctAnswer, clue);
            }
        });
        
        // Add modal to document
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Focus on the input field
        answerInput.focus();
    }
    
    function checkAnswerJSON(questionIndex, correctAnswer, clue) {
        const answerInput = document.getElementById('answerInput');
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        if (userAnswer === correctAnswer.toLowerCase()) {
            // Correct answer!
            
            // Hide the box
            const boxElement = document.getElementById('box' + (questionIndex + 1));
            if (boxElement) {
                boxElement.style.visibility = 'hidden';
            }
            
            // Update the question button to show the clue
            const questionButton = document.getElementById('question' + (questionIndex + 1));
            if (questionButton) {
                questionButton.textContent = clue;
                questionButton.classList.add('answered-correct');
                questionButton.disabled = true; // Disable the button
            }
            
            // Close the modal
            const modal = document.getElementById('questionModal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // Check if all boxes are hidden (game completed)
            checkGameCompletion();
        } else {
            // Wrong answer - make the corresponding box permanently red
            const boxElement = document.getElementById('box' + (questionIndex + 1));
            if (boxElement) {
                boxElement.style.backgroundColor = 'rgba(255, 0, 0)';
                boxElement.classList.add('incorrect');
            }
            
            // Make the question button unclickable and mark as incorrect
            const questionButton = document.getElementById('question' + (questionIndex + 1));
            if (questionButton) {
                // No need to add 'answered-incorrect' class anymore
                // Just disable the button - CSS will handle the styling
                questionButton.disabled = true;
            }
            
            // Close the modal
            const modal = document.getElementById('questionModal');
            if (modal) {
                document.body.removeChild(modal);
            }
        }
    }
    
    function checkGameCompletion() {
        const boxes = document.querySelectorAll('.box');
        let allHidden = true;
        
        boxes.forEach(box => {
            if (box.style.visibility !== 'hidden') {
                allHidden = false;
            }
        });
        
        if (allHidden) {
            setTimeout(function() {
                alert('Congratulations! You revealed the entire image!');
            }, 500);
        }
    }
    
    function setupKeywordCheckingJSON(keyword) {
        const keywordInput = document.getElementById('keywordInput');
        const keywordButton = document.getElementById('keywordButton');
        const keywordStatus = document.getElementById('keywordStatus');
        
        // Clear previous statuses and inputs
        keywordInput.value = '';
        keywordStatus.textContent = '';
        keywordStatus.className = 'keyword-status';
        
        // Add length of keyword as hint
        const keywordLengthHint = document.createElement('div');
        keywordLengthHint.className = 'keyword-length-hint';
        keywordLengthHint.textContent = `Hint: The keyword has ${keyword.length} characters`;
        
        // Find the keyword section and add the hint before the input area
        const keywordSection = document.getElementById('keywordSection');
        const keywordInputArea = document.getElementById('keywordInputArea');
        keywordSection.insertBefore(keywordLengthHint, keywordInputArea);
        
        // Add event listener to the button
        keywordButton.addEventListener('click', function() {
            checkKeywordJSON(keyword);
        });
        
        // Add event listener for Enter key
        keywordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkKeywordJSON(keyword);
            }
        });
    }
    
    function checkKeywordJSON(keyword) {
        const keywordInput = document.getElementById('keywordInput');
        const keywordButton = document.getElementById('keywordButton');
        const keywordStatus = document.getElementById('keywordStatus');
        const userGuess = keywordInput.value.trim().toLowerCase();
        
        if (userGuess === keyword.toLowerCase()) {
            keywordStatus.textContent = 'Correct! The keyword is: ' + keyword;
            keywordStatus.className = 'keyword-status correct';
            keywordInput.disabled = true;
            keywordButton.disabled = true;
            
            // Reveal the entire image by hiding all boxes
            document.querySelectorAll('.box').forEach(box => {
                box.style.visibility = 'hidden';
            });
            
            // Show completion message
            setTimeout(function() {
                alert('Congratulations! You guessed the keyword and revealed the entire image!');
            }, 500);
        } else {
            // Just show text message without changing any background color
            keywordStatus.textContent = 'Incorrect. Try again!';
            keywordStatus.className = 'keyword-status incorrect';
            keywordStatus.style.backgroundColor = 'transparent';
            keywordInput.value = '';
            keywordInput.focus();
        }
    }
    
    function addModalStyles() {
        if (!document.getElementById('modalStyles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'modalStyles';
            styleElement.textContent = `
                .modal {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 5px;
                    width: 80%;
                    max-width: 500px;
                    position: relative;
                }
                
                .question-text {
                    font-size: 1.5em;
                    margin-bottom: 20px;
                }
                
                .answer-input {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    font-size: 1em;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .answer-input.wrong {
                    border-color: red;
                    animation: shake 0.5s;
                }
                
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                    100% { transform: translateX(0); }
                }
                
                .submit-btn {
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1em;
                }
                
                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 1.5em;
                    cursor: pointer;
                }
                
                .answered-correct {
                    background-color: #4CAF50;
                    color: white;
                    font-size: 1em;
                    cursor: not-allowed;
                }
                
                .answered-incorrect {
                    background-color: #F44336;
                    color: white;
                    font-size: 1em;
                    cursor: not-allowed;
                }
                
                .incorrect {
                    background-color: rgba(255, 0, 0, 0.7);
                }
            `;
            document.head.appendChild(styleElement);
        }
    }
});
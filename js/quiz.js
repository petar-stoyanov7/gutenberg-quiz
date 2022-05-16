$(() => {
        if (document.querySelectorAll('.quiz-quiz-container').length) {
            window.dataLayer = window.dataLayer || [];
            const questions = document.querySelectorAll('.quiz-quiz-container .quiz-question-container');
            const quizOverView = document.querySelector('.quiz-quiz-overview');
            const pointsPerAnswer = 100 / questions.length;
            let quizScore = 0;

            const setCookie = (dataObject, name) => {
                const now = new Date();
                const expiry = now.getTime() + (3600 * 100);
                now.setTime(expiry);
                document.cookie = `${name}=` + JSON.stringify(dataObject) + ";" +
                    "expires=" + now.toUTCString() + ";" +
                    "domain=" + window.location.hostname + ";" +
                    "path=/";
            }

            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    return JSON.parse(parts.pop().split(';').shift());
                }
                return false;
            }

            const deleteCookie = (name) => {
                const now = new Date();
                const expiry = now.getTime() - (3600 * 100);
                now.setTime(expiry);
                document.cookie = `${name}="{}"; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.host.toString()}`;
            }

            const setActiveQuestion = (index) => {
                if (index === -1) {
                    //reset quiz
                    document.querySelectorAll('.quiz-quiz-container li.answer').forEach((element) => {
                        element.classList.remove('correct', 'wrong');
                    });
                    document.querySelectorAll('a.next').forEach((element) => {
                        element.classList.add('hide');
                        element.textContent = '';
                    });
                    document.querySelectorAll('ul.steps li').forEach((element) => {
                        element.classList.remove('active');
                    });
                    document.querySelector('.quiz-quiz-container .steps').classList.add('hide');
                    questions.forEach((question) => {
                        question.classList.add('hide');
                    });
                    quizOverView.classList.remove('hide');
                    document.querySelector('.restart').classList.add('hide');
                    quizScore = 0;
                } else if (index === questions.length) {
                    //finished quiz
                    let redirectLink;
                    if (quizScore < 33) {
                        redirectLink = document.getElementById('noviceLink').getAttribute('href');
                    } else if (quizScore < 66) {
                        redirectLink = document.getElementById('adeptLink').getAttribute('href');
                    } else {
                        redirectLink = document.getElementById('proLink').getAttribute('href');
                    }

                    window.location.href = redirectLink;
                } else {
                    if (index > 0) {
                        questions[index - 1].classList.add('hide');
                    }
                    quizOverView.classList.add('hide');
                    questions[index].classList.remove('hide');
                    document.querySelector('.restart').classList.remove('hide');
                    document.querySelector('.steps').classList.remove('hide');
                    const steps = document.querySelectorAll('.steps li');
                    for (let i = 0; i <= index; i++) {
                        steps[i].classList.add('active');
                    }
                }
            }

            const processClick = (event) => {
                const parentAnswer = event.target.closest('li.answer');
                const parentQuestion = event.target.closest('.quiz-question-container');
                const nextButton = parentQuestion.querySelector('a.next');
                const input = parentAnswer.querySelector('input[type="radio"]');
                const correctResponse = parentQuestion.querySelector('.question').dataset.correctButton;
                const incorrectResponse = parentQuestion.querySelector('.question').dataset.incorrectButton;
                const correctAnswer = parseInt(parentQuestion.querySelector('.question').dataset.index);
                const answerIndex = parseInt(input.dataset.val);
                const questionIndex = parseInt(parentQuestion.dataset.index);
                let isCorrect = 0;
                try {
                    new URL(parentAnswer.dataset.image);
                    parentQuestion.querySelector('img.quiz-default-image').src = parentAnswer.dataset.image;
                } catch {
                    console.log('missing image');
                }

                if (answerIndex === correctAnswer) {
                    quizScore += pointsPerAnswer;
                    parentAnswer.classList.add('correct');
                    nextButton.textContent = correctResponse;
                    isCorrect = 1;
                } else {
                    parentQuestion.querySelectorAll('li.answer')[correctAnswer].classList.add('correct');
                    parentAnswer.classList.add('wrong');
                    nextButton.textContent = incorrectResponse;
                }
                nextButton.classList.remove('hide');
                window.dataLayer.push({
                    'event': 'quizAnswerSubmitted',
                    'quizQuestion': parentQuestion.querySelector('h2').textContent,
                    'quizAnswer': input.value,
                    'quizCorrect': isCorrect
                });

                if (questionIndex === questions.length - 1) {
                    window.dataLayer.push({
                        'event': 'quizCompleted',
                        'quizResult': `${quizScore}%`
                    });
                }

                setCookie({
                    activeQuestion: questionIndex + 1,
                    score: quizScore
                }, 'customQuiz');

                nextButton.addEventListener('click', () => {
                    setActiveQuestion(questionIndex + 1);
                });

                //remove click listener
                event.target.closest('ul.answers').querySelectorAll('.answer').forEach((answer) => {
                    answer.removeEventListener('click', processClick, false);
                });
            }

            //setup reset quiz button
            document.getElementById('reset-quiz').addEventListener('click', () => {
                setActiveQuestion(-1, 0);
                deleteCookie('customQuiz');
            });

            //setup start quiz button
            document.getElementById('start-quiz').addEventListener('click', () => {
                setActiveQuestion(0, 0);
                window.dataLayer.push({'event': 'quizStarted'});
                setCookie({
                    activeQuestion: 0,
                    score: 0
                }, 'customQuiz');
            });

            //check for reset _GET param
            if ('1' === new URLSearchParams(window.location.search).get('reset-quiz')) {
                deleteCookie('customQuiz');
            } else if (document.cookie.indexOf('customQuiz') !== -1) {
                const cookieData = getCookie('customQuiz');
                quizScore = cookieData.score;
                setActiveQuestion(cookieData.activeQuestion);
            }

            //looping through questions.
            questions.forEach((questionContainer, index) => {
                //looping through answers in current question
                questionContainer.querySelectorAll('ul.answers li.answer').forEach((answer) => {
                    answer.addEventListener('click', processClick, false);
                });
            });
        }
    }
);

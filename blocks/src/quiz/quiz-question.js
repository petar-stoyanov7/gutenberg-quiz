const {__} = wp.i18n;
const {registerBlockType} = wp.blocks; // Import registerBlockType() from wp.blocks
const {
    MediaUpload,
    MediaUploadCheck,
    PlainText,
} = wp.blockEditor;
const {
    Button,
    SelectControl
} = wp.components;

const {
    Component
} = wp.element;

const blockAttributes = {
    questionIndex: {
        type: 'number',
        default: 1,
    },
    title: {
        type: 'string',
    },
    mainImageId: {
        type: 'number',
        default: null,
    },
    mainImageUrl: {
        type: 'string',
        default: null
    },
    correctAnswer: {
        type: 'number',
        default: 1,
    },
    answers: {
        type: 'array',
        default: []
    },
    correctResponse: {
        type: 'string',
    },
    incorrectResponse: {
        type: 'string',
    }
}

class blockEdit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            answer: {
                mediaId: null,
                mediaUrl: null,
                text: null
            }
        }
    }

    addAnswer(answers) {
        const tempAnswers = [...answers];
        tempAnswers.push(this.state.answer);
        this.props.setAttributes({answers: tempAnswers});
        this.setState({
            answer: {
                mediaId: null,
                mediaUrl: null,
                text: ''
            }
        });
    }

    removeAnswer(index, answers) {
        const tempAnswers = [...answers];
        tempAnswers.splice(index, 1);
        this.props.setAttributes({answers: tempAnswers});
    }

    editAnswerText(text, index, answers) {
        const tempAnswers = [...answers];
        tempAnswers[index].text = text;
        this.props.setAttributes({answers: tempAnswers});
    }

    editAnswerMedia(media, index, answers) {
        const tempAnswers = [...answers];
        tempAnswers[index].mediaId = media.id;
        tempAnswers[index].mediaUrl = media.url;
        this.props.setAttributes({answers: tempAnswers});
    }

    moveUp(index, answers) {
        const tempAnswers = [...answers];
        const currentAnswer = tempAnswers[index];
        tempAnswers[index] = tempAnswers[index - 1];
        tempAnswers[index - 1] = currentAnswer;
        this.props.setAttributes({answers: tempAnswers});
    }

    moveDown(index, answers) {
        const tempAnswers = [...answers];
        const currentAnswer = tempAnswers[index];
        tempAnswers[index] = tempAnswers[index + 1];
        tempAnswers[index + 1] = currentAnswer;
        this.props.setAttributes({answers: tempAnswers});
    }

    render() {
        const {
            attributes: {
                questionIndex,
                title,
                mainImageId,
                mainImageUrl,
                correctAnswer,
                correctResponse,
                incorrectResponse,
                answers
            },
            setAttributes
        } = this.props;

        let answerFields = [];
        let answerOptions = [];

        if (answers.length) {
            const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

            answers.forEach((answer, index) => {
                answerFields.push(
                    <div className='quiz-question__field question-list' key={index}>
                        <h3>{alphabet[index]}</h3>
                        <figure
                            className={answer.mediaId ? 'quiz-question__field-image' : 'quiz-question__field-image no-image'}
                            style={{backgroundImage: 'url("' + answer.mediaUrl + '")'}}
                            key={index}
                        >
                            <MediaUploadCheck>
                                <MediaUpload
                                    allowedTypes="image"
                                    value={answer.mediaId}
                                    onSelect={(media) => {
                                        this.editAnswerMedia(media, index, answers);
                                    }}
                                    render={({open}) => (
                                        <Button
                                            className='button small success'
                                            onClick={open}
                                        >
                                            {!answer.mediaId ? 'Upload Answer Image' : 'Change Answer Image'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        </figure>
                        <div className="quiz-question__field-text">
                            <PlainText
                                className='quiz-question__answer'
                                label='Quiz Answer'
                                value={answer.text}
                                onChange={(text) => {
                                    this.editAnswerText(text, index, answers);
                                }}
                            />
                            <Button
                                className='button small alert'
                                onClick={() => {
                                    this.removeAnswer(index, answers);
                                }}
                            >
                                Delete Answer
                            </Button>
                            {index > 0 ?
                                (<Button
                                    className='button small warning answer-navigation answer-nav-up'
                                    onClick={() => {
                                        this.moveUp(index, answers);
                                    }}
                                >
                                    U
                                </Button>)
                                : ''}
                            {index < answers.length - 1 ?
                                (<Button
                                    className='button small warning answer-navigation answer-nav-down'
                                    onClick={() => {
                                        this.moveDown(index, answers);
                                    }}
                                >
                                    D
                                </Button>)
                                : ''}
                        </div>
                    </div>
                );

                answerOptions.push(
                    {
                        'label': answer.text,
                        'value': index
                    }
                );
            });
        }

        setAttributes({questionIndex: questionIndex});

        return (
            <div className="quiz-question is-admin" data-index={questionIndex}>
                <div className="quiz-question__general">
                    <figure
                        className={mainImageId ? 'quiz-question__main-image' : 'quiz-question__main-image no-image'}
                        style={{backgroundImage: 'url("' + mainImageUrl + '")'}}
                    >
                        <MediaUploadCheck>
                            <MediaUpload
                                allowedTypes="image"
                                value={mainImageId}
                                onSelect={(media) => {
                                    setAttributes({
                                        mainImageId: media.id,
                                        mainImageUrl: media.url,
                                    })
                                }}
                                render={({open}) => (
                                    <Button
                                        className='button button-large button-upload'
                                        onClick={open}
                                    >
                                        {!mainImageId ? 'Upload Answer Image' : 'Change Answer Image'}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                    </figure>
                    <div className="quiz-question__question">
                        <PlainText
                            label='Quiz Question'
                            placeholder='Enter the quiz question'
                            value={title}
                            onChange={(text) => {
                                setAttributes({title: text});
                            }}
                        />
                        <SelectControl
                            label="Correct Answer"
                            value={correctAnswer}
                            options={answerOptions}
                            onChange={(answer) => {
                                setAttributes({correctAnswer: parseInt(answer)});
                            }}
                        />
                    </div>
                    <div className="quiz-question__index">
                        #{questionIndex + 1}
                    </div>
                </div>
                <div className="quiz-question__response">
                    <PlainText
                        className='quiz-question__response-correct'
                        label='Enter the response text for the correct answer'
                        placeholder='Enter the quiz question'
                        value={correctResponse}
                        onChange={(text) => {
                            setAttributes({correctResponse: text});
                        }}
                    />
                    <PlainText
                        className='quiz-question__response-incorrect'
                        label='Enter the response text for an incorrect answer'
                        placeholder='Enter the quiz question'
                        value={incorrectResponse}
                        onChange={(text) => {
                            setAttributes({incorrectResponse: text});
                        }}
                    />
                </div>
                <div className="quiz-question__new">
                    <div className='quiz-question__field'>
                        <h3>Add answer:</h3>
                        <figure
                            className={this.state.answer.mediaId ? 'quiz-question__field-image' : 'quiz-question__field-image no-image'}
                            style={{backgroundImage: 'url("' + this.state.answer.mediaUrl + '")'}}
                        >
                            <MediaUploadCheck>
                                <MediaUpload
                                    allowedTypes="image"
                                    value={this.state.answer.mediaId}
                                    onSelect={(media) => {
                                        let tempAnswer = {...this.state.answer};
                                        tempAnswer.mediaId = media.id;
                                        tempAnswer.mediaUrl = media.url;
                                        this.setState({answer: tempAnswer});
                                    }}
                                    render={({open}) => (
                                        <Button
                                            className='button small success'
                                            onClick={open}
                                        >
                                            {!this.state.answer.mediaId ? 'Upload Image' : 'Change Image'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        </figure>
                        <div className="quiz-question__field-text">
                            <PlainText
                                className='quiz-question__question'
                                label='Quiz Answer'
                                placeholder='Enter quiz answer here'
                                value={this.state.answer.text}
                                onChange={(text) => {
                                    let tempAnswer = {...this.state.answer};
                                    tempAnswer.text = text;
                                    this.setState({answer: tempAnswer});
                                }}
                            />
                            <Button
                                disabled={!Boolean(this.state.answer.text)}
                                className='button small success'
                                onClick={() => {
                                    this.addAnswer(answers);
                                }}
                            >
                                Add Answer
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="quiz-question__current">
                    {answerFields}
                </div>
            </div>
        );
    }
}

registerBlockType(
    'custom/custom-quiz-question',
    {
        'title': __('Quiz Question'),
        'icon': 'admin-comments',
        'category': 'widgets',
        'parent': ['custom/custom-quiz'],
        'keywords': [
            __('quiz'), __('question'), __('custom'), __('custom quiz'),
        ],
        'attributes': blockAttributes,
        edit: blockEdit,
        save: (props) => {
            const {
                attributes: {
                    questionIndex,
                    title,
                    mainImageUrl,
                    correctAnswer,
                    correctResponse,
                    incorrectResponse,
                    answers
                },
            } = props;

            const alphabet = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
            const answersMarkup = answers.map((answer, index) => {
                const idString = `input-${questionIndex}-${index}`;
                return (
                    <li
                        className="answer"
                        data-image={answer.mediaUrl}
                    >
                        <label htmlFor={idString}>
              <span>
                {alphabet[index]}
              </span>
                            {answer.text}
                        </label>
                        <input
                            id={idString}
                            type='radio'
                            name='answer'
                            data-val={index}
                            value={answer.text}
                        />
                    </li>
                );
            });

            return (
                <div
                    className="quiz-question-container grid-x grid-margin-x small-order-1 hide"
                    data-index={questionIndex}
                >
                    <div
                        className="cell small-12 medium-6 small-order-2 question"
                        data-correct-button={correctResponse ? correctResponse : 'Correct answer!'}
                        data-incorrect-button={incorrectResponse ? incorrectResponse : 'Wrong answer!'}
                        data-index={correctAnswer}
                    >
                        <span>Question #{questionIndex + 1}</span>
                        <h2 className="question-title text-center medium-text-left">{title}</h2>
                        <p className="choose-one">Choose one</p>
                        <ul className="answers">
                            {answersMarkup}
                        </ul>
                        <a className='next hide'></a>
                    </div>
                    <div className="cell small-12 medium-6 small-order-1 answer-image">
                        <img
                            className="quiz-default-image"
                            src={mainImageUrl}
                        />
                    </div>
                </div>
            );
        },
    }
);

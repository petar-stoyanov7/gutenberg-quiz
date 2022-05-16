const {__} = wp.i18n; // Import __() from wp.i18n
const {registerBlockType, Component} = wp.blocks; // Import registerBlockType() from wp.blocks
const {
    MediaUpload,
    MediaUploadCheck,
    PlainText,
    InnerBlocks,
    InspectorControls,
    URLInput,
} = wp.blockEditor;

const {
    dispatch,
    select
} = wp.data;

const {
    Button,
    PanelBody,
} = wp.components;

const blockAttributes = {
    quizTitle: {
        type: 'string'
    },
    quizDescription: {
        type: 'string'
    },
    quizCoverId: {
        type: 'number',
        default: null,
    },
    quizCoverUrl: {
        type: 'string',
        default: '',
    },
    blocksNumber: {
        type: 'number',
    },
    noviceUrl: {
        type: 'string',
    },
    adeptUrl: {
        type: 'string',
    },
    proUrl: {
        type: 'string',
    },
}

const TEMPLATE = [
    ['custom/custom-quiz-question'],
    ['custom/custom-quiz-question'],
    ['custom/custom-quiz-question']
];

registerBlockType(
    'custom/custom-quiz',
    {
        title: __('Quiz'),
        icon: 'admin-comments',
        category: 'widgets',
        keywords: [
            __('slider'), __('quote'), __('quotes')
        ],
        attributes: blockAttributes,
        edit: (props) => {
            const {
                attributes: {
                    quizTitle,
                    quizDescription,
                    quizCoverId,
                    quizCoverUrl,
                    noviceUrl,
                    adeptUrl,
                    proUrl,
                },
                clientId,
                setAttributes
            } = props;

            //get inner blocks;
            const children = select('core/block-editor').getBlocksByClientId(clientId)[0].innerBlocks;


            //give each element its index
            children.forEach((child, index) => {
                dispatch('core/block-editor').updateBlockAttributes(child.clientId, {questionIndex: index});
            });
            setAttributes({blocksNumber: children.length});

            return (
                <div className="custom-quiz">
                    <InspectorControls>
                        <PanelBody
                            title='Completion Links'
                            initialOpen={true}
                        >
                            <URLInput
                                label='Redirect URL for novices (33% or less)'
                                id='noviceUrl'
                                value={noviceUrl}
                                onChange={(url) => {
                                    setAttributes({noviceUrl: url})
                                }}
                            />
                            <URLInput
                                label='Redirect URL for adepts (33% - 66%)'
                                id='adeptUrl'
                                value={adeptUrl}
                                onChange={(url) => {
                                    setAttributes({adeptUrl: url})
                                }}
                            />
                            <URLInput
                                label='Redirect URL for pros (100%)'
                                id='proUrl'
                                style={{width: '100%'}}
                                value={proUrl}
                                onChange={(url) => {
                                    setAttributes({proUrl: url})
                                }}
                            />
                        </PanelBody>

                    </InspectorControls>
                    <div className="custom-quiz__header">
                        <figure
                            className={quizCoverId ? 'custom-quiz__cover' : 'custom-quiz__cover no-image'}
                            style={{backgroundImage: 'url("' + quizCoverUrl + '")'}}
                        >
                            <MediaUploadCheck>
                                <MediaUpload
                                    allowedTypes="image"
                                    value={quizCoverId}
                                    onSelect={(media) => {
                                        setAttributes({
                                            quizCoverId: media.id,
                                            quizCoverUrl: media.url
                                        });
                                    }}
                                    render={({open}) => (
                                        <Button
                                            className='button small success'
                                            onClick={open}
                                        >
                                            {!quizCoverId ? 'Upload Quiz Cover' : 'Change Quiz Cover'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        </figure>
                        <div className="custom-quiz__text">
                            <h3>Enter Quiz Information:</h3>
                            <PlainText
                                className='custom-quiz__title'
                                label='Quiz Title'
                                value={quizTitle}
                                placeholder='Enter the quiz title'
                                onChange={(text) => {
                                    setAttributes({quizTitle: text});
                                }}
                            />
                            <PlainText
                                className='custom-quiz__description'
                                label='Quiz Description'
                                value={quizDescription}
                                placeholder='Enter the quiz description'
                                onChange={(text) => {
                                    setAttributes({quizDescription: text});
                                }}
                            />
                        </div>
                    </div>
                    <div className="custom-quiz__children">
                        <InnerBlocks
                            template={TEMPLATE}
                            allowedBlocks={['custom/custom-quiz-question']}
                            orientation='horizontal'
                        />
                    </div>
                </div>
            );
        },
        save: (props) => {
            const {
                quizTitle,
                quizDescription,
                quizCoverUrl,
                blocksNumber,
                noviceUrl,
                adeptUrl,
                proUrl,
            } = props.attributes;

            let numbers = [];
            for (let i = 1; i <= blocksNumber; i++) {
                const num = i.toString().length < 2 ? `0${i.toString()}` : i.toString();
                numbers.push(
                    <li className="" id={`step${i}`}>{num}</li>
                );
            }

            return (
                <div className="quiz-quiz-container grid-container fluid">
                    <ul className='hide hidden'>
                        <li><a id='noviceLink' href={noviceUrl}>novice</a></li>
                        <li><a id='adeptLink' href={adeptUrl}>adept</a></li>
                        <li><a id='proLink' href={proUrl}>pro</a></li>
                    </ul>
                    <a id="reset-quiz" className="restart small-order-3 hide">Reset quiz</a>
                    <div className="quiz-quiz-overview grid-x grid-margin-x ">
                        <div className="cell small-12 quiz-quiz-overview-col">
                            <h2 className="title">{quizTitle}</h2>
                            <img className="image" src={quizCoverUrl}/>
                            <p className="description">{quizDescription}</p>
                            <a id="start-quiz" className="button blue">Take quiz</a>
                        </div>
                    </div>
                    <InnerBlocks.Content/>
                    <ul className="steps small-order-2 hide">
                        {numbers}
                    </ul>
                </div>
            )
        },
    }
);

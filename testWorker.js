;(function ($, window, document, undefined) {
    let pluginName = 'testWorker'
    let _default = {};
    var dragObject = {};
    let ajaxRequest = false

    
    _default.pagination = {
        nextQuestBtn: '#nextQuest',
        backQuestBtn: '#backQuest',
        switchQuestBtn: '#switchQuest',
    }

    _default.body = {
        questionNumber: '#questionNumber',
        listQuestions: '#listQuestions',
    }

    _default.questionTypes = {
        Ratio: 1,
        Checkbox: 2,
        Input: 3,
        Relation: 4,
        Chron: 5,
    }
    _default.questionTemplates = {
        1: (question, user_answer) => radioButtonQuestion(question, user_answer),
        2: (question, user_answer) => checkboxButtonQuestion (question, user_answer),
        3: (question, user_answer) => InputQuestion(question, user_answer),
        4: (question, user_answer) => relationDragQuestion(question,user_answer),
        5: (question, user_answer) => chronologyDragQuestion(question,user_answer),
    }

    _default.questionClass = {
        0: '.question',
        1: '.groupQuestionsBody',
        2: '.groupQuestionsBodySelect',
        3: '.multiSelectForm',
        4: '.multiInputForm'
    }

    // --- INIT --- //
    let testWorker = function (element) {
        this.$layout = $(element) // layout test

        this.numberQuestion = 0;

        return {
            init: $.proxy(this.init, this),
            switchQuestion: $.proxy(this.switchQuestion, this),
            swicthQuestionBackModals: $.proxy(this.swicthQuestionBackModals, this),
            nextQuestion: $.proxy(this.nextQuestion, this),
            modalsButton: $.proxy(this.modalsButton, this),
            prevQuestion: $.proxy(this.prevQuestion, this)
        };
    }
    testWorker.prototype.init = async function (test) {
        this.$test = test; // test json
        if (this.$test['questions'].length) {
            this.cQuestion = this.$test['questions'][this.numberQuestion];
            this.countQuestions = this.$test['questions'].length;
            this.questionBody = $('#questionBody');
            this.ajaxRequest = false;
            this.builderQuestion(this.cQuestion);
            this.buildSidebar();
            this.timer();
            document.querySelector('#passageBtn').addEventListener('click', event => {passage(this.$test)})
            this.currentQuestions(this.numberQuestion);
            } else { // Если не дай бог зайдется в тест без вопросов - закинем такую заглушку....
            $('.quest_body').html( `Внутренняя ошибка. Обратитесь к администратору support@rosnou.ru`);
            logError('Вопросы не найдены.')
        }
    }
    // --- Сохранение/Завершение --- //

    function ajaxPost(url,dataType,data){
        return $.ajax({
            method: 'post',
            url: url,
            dataType:dataType,
            headers:{
                "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr('content')
            },
            data:data
        })
    }
    function ajaxRequestQuestion(question,answers){
        ajaxRequest = true;
        return ajaxPost(
            'answer/' + question,
            'json',
            {'answers': answers}
        )
    }
    function passage(test){
        ajaxPost('passage/' + test['id']).done(function (data){
            window.location.assign(data.url)
        }).fail(function (){
            alert("Произошла ошибка. Напишите на support@stud.rosnou.ru");
        });
    }

    testWorker.prototype.ScrollTo = function (){
        console.log($('#switchQuest_' + this.numberQuestion).height());
        if (window.innerWidth < 1150){
            if(this.numberQuestion == 0){
                $('.list_questionsScrollbar').scrollLeft(
                    $('#switchQuest_' + this.numberQuestion).offset().left -  $('.list_questionsScrollbar').offset().left + $('.list_questionsScrollbar').scrollLeft()
                );
            }else{
                $('.list_questionsScrollbar').scrollLeft(
                    $('#switchQuest_' + this.numberQuestion).offset().left - $('#switchQuest_' + this.numberQuestion).width() - 20 - $('.list_questionsScrollbar').offset().left + $('.list_questionsScrollbar').scrollLeft()
                );
            }
        }else{
            if(this.numberQuestion == 0) {
                $('.list_questionsScrollbar').scrollTop(
                    $('#switchQuest_' + this.numberQuestion).offset().top - $('.list_questionsScrollbar').offset().top + $('.list_questionsScrollbar').scrollTop()
                );
            }else{
                $('.list_questionsScrollbar').scrollTop(
                    $('#switchQuest_' + this.numberQuestion).offset().top - $('#switchQuest_' + this.numberQuestion).height() - 10 - $('.list_questionsScrollbar').offset().top + $('.list_questionsScrollbar').scrollTop()
                );
            }
        }
        window.scrollTo({top: 0});
    }

    // --- Билдеры --- //
    testWorker.prototype.builderQuestion = function (question) {
        if (question['question_form'] == 'question_group'){
            this.questionBody.html(
                GroupTemplate(question, this)
            );
        }else{
            let user_answer = this.searchAnswer(question['id'])
            this.questionBody.html(
                _default.questionTemplates[question.question_type](question, user_answer)
            );
            if (question.question_type == "5") this.Sorted();
            if (question.question_type == "4") this.Start(question);
        }
       $('#questionNumber').html(this.getQuestionNumbers(this.numberQuestion));
        $.each($(".question"),function (){
            renderMathInElement(this, {
                delimiters: [
                    {left: '\\\(', right: '\\\)',display: true},
                ],
                // • rendering keys, e.g.:
                throwOnError : true
            });
        })
        //this.ScrollTo();
    }
    testWorker.prototype.buildSidebar = function () {
        let layoutListQuestions = document.querySelector("#listQuestions");
        let ListQuestions = ``;
        let ListQuestionsModal = ``;
        let self = this; // за такое на районе бьют рожу...
        this.$test['questions'].forEach(function (question, k) {
            if (question['isAnswered']) {
                ListQuestions += `<div class="questionNumber_Answered" onclick="tw.testWorker('swicthQuestionBackModals', [${k}])" id="switchQuest_${k}" style="cursor: pointer">
                                    <div>
                                        <p>Вопрос ${self.getQuestionNumbers(k)}</p>
                                        <p class="type_otv">Ответ принят</p>
                                    </div>
                                    <span class="icon-tick-24" style="color: #2699D4"></span>
                                    </div>`
            } else {
                ListQuestions += `<div class="questionNumber_NotAnswered" onclick="tw.testWorker('swicthQuestionBackModals', [${k}])" id="switchQuest_${k}" style="cursor: pointer">
                                    <div>
                                        <p>Вопрос ${self.getQuestionNumbers(k)}</p>
                                            <p class="type_otv">Ожидает ответа</p>
                                    </div>
                                    <span class="icon-clock-24" style="color: #ABBCD1"></span>
                                   </div>`
            }
        })
        this.$test['questions'].forEach(function (question, k) {
            if (question['isAnswered']) {
                ListQuestionsModal += `<div class="questionModals_Answered" onclick="tw.testWorker('swicthQuestionBackModals', [${k}])" id="switchQuestModal_${k}" style="cursor: pointer" data-dismiss="modal" aria-label="Close">
                                    <div>
                                        <p>Вопрос ${self.getQuestionNumbers(k)}</p>
                                        <p class="type_otv">Ответ принят</p>
                                    </div>
                                    <div>
                                        <span class="icon-tick-24" style="color: #2699D4"></span>
                                    </div>
                                </div>`
            } else {
                ListQuestionsModal += `<div class="questionModals_Notanswered" onclick="tw.testWorker('swicthQuestionBackModals', [${k}])" id="switchQuestModal_${k}" style="cursor: pointer" data-dismiss="modal" aria-label="Close">
                                    <div>
                                        <p>Вопрос ${self.getQuestionNumbers(k)}</p>
                                            <p class="type_otv">Нет ответа</p>
                                    </div>
                                    <span class="icon-warning-24" style="color: #F3AF52;"></span>
                                 </div>`
            }
        })
        layoutListQuestions.innerHTML = ListQuestions;
        document.querySelector(".modalBody").innerHTML = ListQuestionsModal;
        this.ScrollTo();
    }
    testWorker.prototype.saveAnswer = function (questId) {
        // Сохранение вопроса + отправка на сервер ответа?
        let question = this.$test['questions'][questId]
        let answers = new Array();
        if (question['question_form'] == 'question_group') {
            let layoutQuestions = document.querySelectorAll(_default.questionClass[question['group_type']]);
            layoutQuestions.forEach(function (layoutQuestion) {
                let answer = []
                switch(question['group_type']) {
                    case 1: // Радио/Чекбокс (Справа)
                        layoutQuestion.querySelectorAll('.formCheckInput').forEach( function (elem) {
                            answer.push({
                                'option_id': elem.getAttribute('value'),
                                'selected': elem.checked
                            })
                        });
                        break;
                    case 2: // Селекты (Справа)
                    case 3: // Мульти-селект (Внутри текста)
                        layoutQuestion.querySelectorAll('.multiOptionSelect').forEach( function (elem) {
                            if (elem.id != -1) {
                                answer.push({
                                    'option_id': elem.id,
                                    'selected': elem.selected
                                })
                            }
                        });
                        break;

                    case 4: // Мульти-Инпут (Внутри текста)
                        answer.push({'answer': layoutQuestion.value})

                        break;
                }
                answers.push({
                    'question_id': layoutQuestion['id'],
                    'answer': answer
                })
            });
        } else {
            let layoutQuestions = document.querySelector(_default.questionClass[0]);
            answers.push({
                'question_id': question['id'],
                'answer': []
            })
            switch (question['question_type']) {
                case 1:
                case 2: // Чекбокс
                    layoutQuestions.querySelectorAll('.formCheckInput').forEach(function(elem) {
                        answers[0]['answer'].push({
                            'option_id': elem.getAttribute('value'),
                            'selected': elem.checked
                        })
                    })
                    break;
                case 3: // Инпут
                    let answer = layoutQuestions.querySelector('.quest_BodyIP_input')
                    answers[0]['answer'].push({
                        'answer': answer.value
                    })
                    break;
                case 4: // Соотношение
                    answers[0]['not_answered'] = [];
                    layoutQuestions.querySelectorAll('.border_dashed').forEach(function(elem) {
                        let option = elem.querySelector('.drop_Zone_Info')
                        let answer = elem.querySelector('.drop_elem')
                        answers[0]['answer'].push({
                            'option_id': option.getAttribute('id'),
                            'answer_id': answer ? answer.getAttribute('id') : null
                        })
                    })

                    layoutQuestions.querySelectorAll('.dragStart .drop_elem').forEach(function (elem) {
                        answers[0]['not_answered'].push({
                            'answer_id': elem.id
                        })
                    });

                    break;
                case 5: // Хронология
                    answers[0]['not_answered'] = [];
                    layoutQuestions.querySelectorAll('.dropZoneChronology .drop_elemChronology').forEach(function(elem) {
                        answers[0]['answer'].push({
                            'option_id': elem.getAttribute('id'),
                        })
                    })
                    if(!answers['answer']) answers[0]['answer'].push({'option_id':null});
                    layoutQuestions.querySelectorAll('.dragStartChronology .drop_elemChronology').forEach(function (elem) {
                        answers[0]['not_answered'].push({
                            'option_id': elem.id,
                        })
                    })
                    break;
            }
        }
        let self = this;
        this.storeAnswers(answers);
        return answers;
    }


    // --- Переключатели вопросов --- //
    testWorker.prototype.switchQuestion = function (questId = this.numberQuestion) {
        buttonsDisabled('flex','relative',true,1);
        $('#switchQuest_' + this.numberQuestion).css('border','none');
        let prevquest = this.numberQuestion;
        let answers = this.saveAnswer(this.numberQuestion);
        this.numberQuestion = questId;
        let self = this;
        this.cQuestion = this.$test['questions'][questId];
        ajaxRequestQuestion(this.$test['id'],answers
        ).done(function (response){
            self.$test['questions'][prevquest]['isAnswered'] = response['status'];
            response['status'] ? changeClassStyle(1, prevquest,self.$test) : changeClassStyle(2, prevquest,self.$test);
            self.builderQuestion(self.cQuestion);
            self.currentQuestions(questId);
            self.visualSwitchQuest();
            buttonsDisabled('none','none',false,0);
            ajaxRequest = false;
            self.ScrollTo();
        }).fail(function (){
            $('#questionBody').html('Непредвиденная ошибка. Напишите в тех-поддержку support@stud.rosnou.ru ');
        });
    }
    testWorker.prototype.swicthQuestionBackModals = function (questId = this.numberQuestion){
        if (!ajaxRequest){
            $('#switchQuest_' + this.numberQuestion).css('border','none');
            this.numberQuestion = questId;
            this.cQuestion = this.$test['questions'][questId];
            this.builderQuestion(this.cQuestion);
            this.currentQuestions(questId);
            this.visualSwitchQuest();
        }
    }
    testWorker.prototype.modalsButton = function (){
        $("#exampleModal").modal('show');
        this.switchQuestion();
    }
    testWorker.prototype.nextQuestion = function () {
        this.switchQuestion(this.numberQuestion + 1);
    }
    testWorker.prototype.prevQuestion = function () {
        this.switchQuestion(this.numberQuestion - 1);
    }

    // --- Отрисовка макетов --- //

    function radioButtonQuestion (question, user_answer){
        let templateLabel = ``;
        if (question['text'] != null) templateLabel = LoadHugeText(question,user_answer);
        templateLabel += `<div class="d-flex justify-content-start"><h6 class="questionTTest_quest"> ${question['question']}</h6></div>`;
        templateLabel = LoadImages(question,templateLabel);
        let templateQuestion = ``;
        $.each(question['options'], function(key,option) {
            let selected = isSelectedOption(user_answer, option['id']) ? 'checked' : ''
            templateQuestion += `
                           <div class="form-check" style="margin-top: 24px;margin-left: 8px">
                               <input class="formCheckInput" type="radio" value = "${option['id']}" name ="RadioButtons" id="RadioButtons_${option['id']}" ${selected} style="box-shadow: none">
                               <label class="formCheckRadio" for="RadioButtons_${option['id']}">
                                   ${option['option']}
                               </label>
                           </div>`;
        })
        return `${templateLabel}
                   ${templateQuestion}`;
    }
    function checkboxButtonQuestion (question,user_answer){
        let templateLabel = ``;
        if (question['text'] != null)  templateLabel = LoadHugeText(question,user_answer);
        templateLabel += `<h6 class="questionTTest_quest"> ${question['question']}</h6>`;
        templateLabel = LoadImages(question,templateLabel);
        let templateQuestion = ``;
        $.each(question['options'], function(key,option) {
            let selected = isSelectedOption(user_answer, option['id']) ? 'checked' : ''
            templateQuestion += `
                        <div class="form-check"  style="margin-top: 24px;margin-left: 8px">
                            <input class="formCheckInput" type="checkbox" value = "${option['id']}" id="checkButtons_${option['id']}" style="box-shadow: none" ${selected}>
                            <label class="formCheckCkebox ps-2" for="checkButtons_${option['id']}">${option['option']}</label>
                        </div>`;
        });
        return `${templateLabel}
                ${templateQuestion}`;
    }
    function InputQuestion (question,user_answer){
        let UserAnswer = getUserAnswer(user_answer);
        let templateLabel = ``;
        if (question['text'] != null)  templateLabel = LoadHugeText(question,user_answer);
        templateLabel += `<h6 class="questionTTest_quest"> ${question['question']}</h6>`;
        templateLabel = LoadImages(question,templateLabel);
        let templateQuestion = `<p class="InputTextAnsw">Ответ:</p>
                    <div class="col p-0 quest_BodyIP">
                        <input class ="quest_BodyIP_input placeholder_input" type="text" oninput="inputAnswer('#inputAnswer')"  id="inputAnswer" value="${UserAnswer}">
                        <p><span class="count_row">${UserAnswer.length}</span>/100 символов</p>
                    </div>`;

        return `${templateLabel}
                    ${templateQuestion}`;
    }
    function relationDragQuestion(question,user_answer){
        let templateLabel = ``;
        if (question['text'] != null)  templateLabel = LoadHugeText(question,user_answer);
        templateLabel += `<h6 class="questionTTest_quest"> ${question['question']}</h6>
                <p class="infoDrag_text">Потяните за значок<span class="icon-drag-dots-24 iconsdragStyle"></span>чтобы изменить расположение элемента.</p>`;
        let image = question['image'] ? `<img class="img_quest" src="/storage/media/1.jpg">` : ``;
        let templateQuestion = `<div style="margin: 32px 0px">
                       <div style="justify-content: space-between;display: flex;align-items: baseline"><p class="terminsDrag">Термины</p>
                        <button class="tertiary_button" id = "removeDrag"><span class="icon-cross-24" style="color: #ABBCD1;"></span> Очистить всё</button></div>`;
        $.each(question['options'], function(key,option) {
            let answer = null;
            let relation = getRelated(question, user_answer, option['id'])
            if (relation) {
                if (question['options'].length > question['answers'].length){
                    answer = `<div class="drop_elem clone" id="${relation['id']}"><span class="icon-drag-dots-24 iconsdragStyle" style="margin-right: 23px;margin-left: 0"></span><div class = "answer">${relation['answer']}</div></div>`;
                }else{
                    answer = `<div class="drop_elem" id="${relation['id']}"><span class="icon-drag-dots-24 iconsdragStyle" style="margin-right: 23px;margin-left: 0"></span><div class = "answer">${relation['answer']}</div></div>`;
                }
            } else {
                answer = `<p class="placeholderQuest">Перетащите сюда подходящий ответ</p>`;
            }
            templateQuestion += `
                        <div class="border_dashed">
                            <div class="col-3 drop_Zone_Info" id="${option['id']}">
                                ${option['option']}
                            </div>
                            <span class="icon-arrow-angle-right-24" style="color: #ABBCD1;font-size: 24px;padding: 0px 24px"></span>
                             <div class="col dropZone">
                               ${answer}
                            </div>
                        </div>`;
        });
        templateQuestion += `</div>`;

        let templateDropElems = ``;
        let notAnswered;
        question['options'].length > question['answers'].length ? notAnswered = question['answers'] : notAnswered = user_answer ? (user_answer['not_answered'] ? user_answer['not_answered'] : []) : (question['answers']);
        $.each(notAnswered, function(key,answer) {
            answer = answer['answer'] ? answer : getAnswer(question, answer['answer_id']);
            templateDropElems += `<div class="drop_elem" id="${answer['id']}"><span class="icon-drag-dots-24 iconsdragStyle" style="margin-right: 23px;margin-left: 0"></span><div class = "answer">${answer['answer']}</div></div>`;
        });
        templateDropElems ? templateQuestion += `<div class="dragStart_display">` : templateQuestion += `<div class="dragStart_display" style="display: none">`;
        templateQuestion += `<p class="terminsDrag" ">Определения</p>
                                    <div class="dragStart">
                                        ${templateDropElems}
                                    </div>
                                 </div>`;
        return `${templateLabel}
                    ${image}
                    ${templateQuestion}`;
    }
    function chronologyDragQuestion(question,user_answer){
        let templateZone = ``
        let image = question['image'] ? `<img src="${question['image']}">` : ``;

        let Answered = user_answer ? (user_answer['answer'] ? user_answer['answer'] : []) : [];
        Answered.forEach(function (option){
            if (option['option_id'] == null)  return;
            option = option['option'] ? option : getOption(question, option['option_id'])
            templateZone += `<div class="drop_elemChronology" id="${option['id']}"><span class="icon-drag-dots-24 iconsdragStyle" style="margin-left: 0; margin-right: 23px;"></span><div class="dragElemParse"> ${option['option']}</div></div>`;
        })

        let templateLabel = ``;
        if (question['text'] != null)  templateLabel = LoadHugeText(question,user_answer);
        templateLabel += `<h6 class="questionTTest_quest"> ${question['question']}</h6>
                <p class="infoDrag_text">Потяните за значок<span class="icon-drag-dots-24 iconsdragStyle"></span>чтобы изменить расположение элемента.</p>
                <div style="margin: 32px 0px">
                    <div class="dropZoneChronology" id = "dropZoneChronology" style="display: grid;">${templateZone}</div>
                </div>`;
        let templateQuestion = ``

        let notAnswered = user_answer ? (user_answer['not_answered'] ? user_answer['not_answered'] : []) : (question['options']);
        let templateChronology = ``;
        notAnswered.forEach(function(option) {
            option = option['option'] ? option : getOption(question, option['option_id'])
            templateChronology += `<div class="drop_elemChronology" id="${option['id']}"><span class="icon-drag-dots-24 iconsdragStyle" style="margin-left: 0; margin-right: 12px;"></span><div class="dragElemParse"> ${option['option']}</div></div>`;
        });

        templateQuestion += `<div class="dragStart_display">
                                    <div class="dragStartChronology" id = "dragStartChronology" style="height: auto">
                                        ${templateChronology}
                                    </div>
                                 </div>`;

        return `${templateLabel}
                    ${image}
                    ${templateQuestion}`;
    }

    function GroupTemplate(questionGroup, _this){
        let templateHeader = `<h6 class="questionTTest_questGroup">${questionGroup['description']}</h6>`;
        //templateHeader = LoadImages(question,templateHeader);
        let templateGroup = ``;
        let templateQuestions =``;
        switch (questionGroup.group_type) {
            case 1: // Радио/Чеки
            case 2: // Соотношение (селектом)
                let templateText = `<p class="groupTestHeaderText" style="margin-bottom: 0; white-space: pre-line ">${questionGroup['text']}</p>`;
                templateText = LoadImages(questionGroup,templateText);
                $.each(questionGroup['questions'], function (key,question) {
                    let user_answer = _this.searchAnswer(question['id'])
                    if (questionGroup['group_type'] == 1) {
                        templateQuestions += radioCheckGroupQuestion(question, user_answer)
                    } else {
                        templateQuestions += selectGroupQuestion(question, user_answer, questionGroup['options'])
                    }
                });

                templateGroup += `${templateHeader}
                                  <div class="row m-0">
                                    <div class="col-6 aligntTextGroup">
                                        ${templateText}
                                    </div>
                                    <div class="col-6 alignTextQuestion">
                                        ${templateQuestions}
                                    </div>
                                  </div>`;

                break;

            case 3: // Мульти-селект
            case 4: // Мульти-инпут
                let question_text = questionGroup['text'];
                $.each(questionGroup['questions'], function (key,question) {
                    let user_answer = _this.searchAnswer(question['id'])
                    if (questionGroup['group_type'] == 3) {
                        question_text = question_text.replace(`{question_${question['id']}}`, multiSelectGroup(question, user_answer));
                    }else{
                        question_text = question_text.replace(`{question_${question['id']}}`, multiInputGroup(question, user_answer));
                    }
                })
                question_text = LoadImages(questionGroup,question_text);
                templateGroup += `${templateHeader}
                                    <div class="row">
                                        <div class="col myltiTextStyle">
                                            ${question_text}
                                        </div>
                                    </div>`
                break;
        }
        return `${templateGroup}`
    }
    function radioCheckGroupQuestion(question, user_answer){
        let templateQuestion = ``;
        switch(question['question_type']) {
            case 1:
                templateQuestion += `<div class="groupQuestionsBody" id="${question['id']}">
                                        <h6 class="groupRadioHeader"><span style="margin-right:5px"></span> ${question['question']}</h6>`;
                $.each(question['options'], function (key,option) {
                    let selected = isSelectedOption(user_answer, option['id']) ? 'checked' : ''
                    templateQuestion += `<div class="groupRadio" style="margin-top: 8px;">
                                                <input class="formCheckInput" type="radio" name="RadioButtons_${question['id']}" value = "${option['id']}" id="RadioButtons_${option['id']}"  style="box-shadow: none" ${selected}>
                                                <label class="groupRadioLabel" for="RadioButtons_${option['id']}">${option['option']}</label>
                                             </div>`;
                });
                templateQuestion += `</div>`;
                break;
            case 2:
                templateQuestion += `<div class="groupQuestionsBody" id="${question['id']}">
                                        <h6 class="groupRadioHeader"><span style="margin-right:5px"></span> ${question['question']}</h6>`;
                $.each(question['options'], function (key,option) {
                    let selected = isSelectedOption(user_answer, option['id']) ? 'checked' : ''
                    templateQuestion += `<div class="groupRadio">
                                                <input class="formCheckInput" type="checkbox" value = "${option['id']}" id="CheckButtons_${option['id']}"  style="box-shadow: none" ${selected}>
                                                <label class="groupCheckLabel" for="CheckButtons_${option['id']}">${option['option']} </label>
                                            </div>`;
                });
                templateQuestion += `</div>`;
                break;
        }
        return templateQuestion;
    }
    function selectGroupQuestion (question, user_answer, options){
        let templateQuestion = ``;
        templateQuestion += `<div class="groupQuestionsBodySelect" id="${question['id']}">
                                <h6 class="groupRadioHeader"><span style="margin-right:5px"></span> ${question['question']}</h6>`;
        templateQuestion += `<select class="multiSelectForm" id=${question['id']} style="padding-right: 40px"><option class="multiOptionSelect"  id="-1" selected style="display: none">Выберите ответ</option>`;
        $.each(options, function (key,option){
            let selected = isSelectedOption(user_answer, option['id']) ? 'selected' : ''
            templateQuestion += `<option class = "multiOptionSelect" id = ${option['id']} ${selected}>${option['option']}</option>`;
        })
        templateQuestion += `</select>`;
        templateQuestion += `</div>`;

        return `${templateQuestion}`;
    }
    function multiSelectGroup(question, user_answer){
        let templateQuestion = `<select class="multiSelectForm" id = ${question['id']}><option option class="multiOptionSelect"  id="-1" selected style="display: none">Выберите ответ</option>`;
        $.each(question['options'], function (key,option){
            // console.log(user_answer);
            let selected = isSelectedOption(user_answer, option['id']) ? 'selected' : ''
            templateQuestion += `<option class = "multiOptionSelect" value= ${option['id']} id = ${option['id']}  ${selected}>${option['option']}</option>`;
        })
        templateQuestion += `</select>`;
        return `${templateQuestion}`;
    }
    function multiInputGroup(question, user_answer){
        let UserAnswer = getUserAnswer(user_answer);
        let templateQuestion = `<div style="display: inline-flex">
                                                <div class="marginsInput">
                                                    <Input class="multiInputForm" id = ${question['id']}  value="${UserAnswer}">
                                                    <label for=${question['id']} class="LabelMultiInput">${question['question']}</label>
                                                </div>
                                            </div>`;
        return `${templateQuestion}`;
    }

    function LoadImages(question,templateLabel){
        $.each(question['images'],function (key,images){
            if(templateLabel.includes(`{image_${images['file_name']}}`)) {
                templateLabel = templateLabel.replace((`{image_${images['file_name']}}`),`<img class="img_quest" src="/file/${images['uuid']}">`);
            }else{
                templateLabel +=  question['images'] ? `<img class="img_questGroup" src="/file/${images['uuid']}">` : ``;
            }
        });
        return templateLabel;
    }
    function LoadHugeText(question,templateLabel){
        templateLabel = `<div class="huge_zone_text">
                        <div class="huge_zone_scroll">
                            <p class="huge_text">${question['text']}</p>
                        </div>
                    </div>`
        return templateLabel;
    }

    // --- Утилиты --- //

    // --- Функциии по работе drag relation --- ///
    testWorker.prototype.Start = function (question){
        let boolS = false;
        if (question['options'].length > question['answers'].length ){
            boolS = true;
            $("#removeDrag").attr("onClick","DropDrag('0')");
        }else {
            $("#removeDrag").attr("onClick","DropDrag()");
        }
        document.onmousemove = onMouseMove(boolS);
        document.onmouseup = onMouseUp(boolS);
        document.onmousedown = onMouseDown(boolS);
        document.onpointermove = onMouseMove(boolS);
        document.onpointerup = onMouseUp(boolS);
        document.onpointerdown = onMouseDown(boolS);
        return boolS
    }
    const onMouseDown = (param) => (e) =>  {
        if (e.which != 1) return;
        var elem = event.target.closest('.drop_elem');
        if (!elem) return;
        if (param){
            if($(elem).hasClass('clone')){
                dragObject.elem = elem;
            }else{
                dragObject.elem = elem.cloneNode(true);
                if(! $(dragObject.elem).hasClass('clone')) $(dragObject.elem).addClass('clone');
            }
        }else{
            dragObject.elem = elem;
        }

        dragObject.downX = e.pageX;
        dragObject.downY = e.pageY;

        return false;
    }
    const  onMouseMove = (param) => (e) =>  {
        if (!dragObject.elem) return;

        if (!dragObject.avatar) {
            var moveX = e.pageX - dragObject.downX;
            var moveY = e.pageY - dragObject.downY;


            if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                return;
            }


            dragObject.avatar = createAvatar(e);
            if (!dragObject.avatar) {
                dragObject = {};
                return;
            }


            var coords = getCoords(dragObject.avatar);
            var width = document.querySelector('.dropZone');
            dragObject.aram = $(width).width();
            dragObject.elem.style.width = dragObject.aram + 'px';
            dragObject.shiftX = dragObject.downX - coords.left;
            dragObject.shiftY = dragObject.downY - coords.top;


            startDrag(e);
        }
        if (param){
            dragObject.avatar.style.left =  e.pageX -50 + 'px';
            dragObject.avatar.style.top = e.pageY -50 + 'px';
            dragObject.avatar.style.left =  e.pageX -50 + 'px';
            dragObject.avatar.style.top = e.pageY -50 + 'px';
        }else{
            dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
            dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';
        }

        return false;
    }
    const onMouseUp = (param) => (e) => {
        if (dragObject.avatar) {
            finishDrag(e,param);
        }

        dragObject = {};
    }
    function finishDrag(e,param) {
        var dropElem = findDroppable(e);

        if (!dropElem) {
            this.onDragCancel(dragObject,param);
        } else {
            this.onDragEnd(dragObject, dropElem,param);
        }
    }
    function createAvatar(e) {

        var avatar = dragObject.elem;
        var old = {
            parent: avatar.parentNode,
            nextSibling: avatar.nextSibling,
            position: avatar.position || '',
            width: avatar.width || '',
            height: avatar.height || '',
            left: avatar.left || '',
            top: avatar.top || '',
            zIndex: avatar.zIndex || ''
        };

        avatar.rollback = function() {
            old.parent.insertBefore(avatar, old.nextSibling);
            avatar.style.position = old.position;
            avatar.style.left = old.left;
            avatar.style.top = old.top;
            avatar.style.width = old.width;
            avatar.style.height = old.height;
            avatar.style.zIndex = old.zIndex
        };

        return avatar;
    }
    function startDrag(e) {
        var avatar = dragObject.avatar;

        document.body.appendChild(avatar);
        avatar.style.position = 'absolute';
        avatar.style.boxShadow = '0px 8px 24px rgba(27, 49, 77, 0.12)';

    }
    function findDroppable(event) {

        dragObject.avatar.hidden = true;

        var elem = document.elementFromPoint(event.clientX, event.clientY);

        dragObject.avatar.hidden = false;

        if (elem == null) {
            return null;
        }

        return elem.closest('.border_dashed');
    }
    this.onDragCancel = function(dragObject,param)  {
        if (param){
            dragObject.avatar.remove();
        }else{
            dragObject.avatar.rollback();
        }
        dragObject.elem.style.position = 'static';
        dragObject.elem.style.boxShadow = 'none';
    };
    this.onDragEnd = function(dragObject, dropElem,param) {
        let placeholder = $(dropElem).find('.dropZone').find('.placeholderQuest');
        let dropEl = $(dropElem).find('.dropZone').find('.drop_elem');
        if(placeholder) placeholder.remove() ;

        if (dropElem.querySelector('.dropZone').children.length == 1){
            $(dropEl).css('width', $('.border_dashed').width() + 32 + 'px');
            if (param){
                $(dropEl).remove();
                $(dropElem).children('.dropZone').append(dragObject.elem);
            }else{
                $(".dragStart").append(dropEl);
                $(dropElem).children('.dropZone').append(dragObject.elem);
            }
            $('.dragStart_display').css('display','block');
            heightDropElem(dropElem,dragObject);
        }else{
            dropElem.querySelector('.dropZone').append(dragObject.elem);
            heightDropElem(dropElem,dragObject);
        }

        hieghtDropZOneAndPlaceholder();
        if ($('.dragStart').children().length == 0) $('.dragStart_display').css('display','none');
        $(dragObject.elem).css('position','static');
        $(dragObject.elem).css('boxShadow','none');
    };
    function heightDropElem(dropElem,dragObject){
        if($(dropElem).find('.drop_Zone_Info').height() != $(dragObject.elem).height())
            $(dropElem).find('.drop_Zone_Info').css('height',$(dragObject.elem).height() + 16 + 'px');
    }
    function hieghtDropZOneAndPlaceholder(){
        $.each($('.dropZone'), function (key,dropZone){
            if (dropZone.children.length == 0){
                $(dropZone).parents('.border_dashed').find('.drop_Zone_Info').css('height','64px');
                $(dropZone).html(`<p class="placeholderQuest">Перетащите сюда подходящий ответ</p>`);
            }
        })
    }
    function getCoords(elem) {
        var box = elem.getBoundingClientRect();

        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset
        };

    }

    function buttonsDisabled(display,position,bool,type){
        $('.absolute_white_podloshka_loader').css('display',display);
        $('#questionBody').css('position',position);
        function buttonSet(id_buttons){
            $(id_buttons).prop('disabled',bool);
        }
        function loaderType(type){
            type ?  $('#questionBody').append($('<div class="absolute_loader"><div class="loader_buttons"></div>')) :  $('#questionBody').remove('.absolute_loader') ;
        }
        buttonSet('#prevButton');
        buttonSet('#nextButton');
        buttonSet('#ButtonModals');
        loaderType(type);
    }
    testWorker.prototype.visualSwitchQuest = function(){
        this.numberQuestion == 0 ? $('#prevButton').css('display','none') : $('#prevButton').css('display','flex');
        textModals(this.$test);
        if(this.numberQuestion == this.countQuestions - 1){
            this.prevButtonsStyle('primary_button_second','secondary_button','primary_button_second','' +
                'Завершить тест',"tw.testWorker('modalsButton')",'none','end');
        }else{
            this.prevButtonsStyle('secondary_button','primary_button_second','secondary_button','' +
                'Следующий вопрос',"tw.testWorker('nextQuestion')",'block','baseline');
        };
    }
    testWorker.prototype.currentQuestions = function (question){
        $('#switchQuest_'+question).hasClass( "questionNumber_NotAnswered" ) ? $('#switchQuest_'+question).css('border','1px solid #ABBCD1') : $('#switchQuest_'+question).css('border','1px solid #2699D4');
    }
    testWorker.prototype.prevButtonsStyle = function (clas,removeClass,addClass,InnerHtml,onClick,display,alignItems){
        if ($( "#nextButton" ).hasClass(clas)) return;
        $( "#nextButton" ).removeClass(removeClass).addClass(addClass);
        $( "#nextButton" ).html(InnerHtml);
        $("#nextButton").attr("onClick",onClick);
        $("#ButtonModals").css("display",display);
        $(".buttonsTimer").css("align-items",alignItems);
    }
    function changeClassStyle (type,id,questions){
        let elem = $('#switchQuest_'+id);
        let elemModal = $('#switchQuestModal_'+id);
        function changePrevie(elem,removeClass,addClass,InnerHtml,removeIcon,addIcons,color){
            $(elem).removeClass(removeClass).addClass(addClass);
            $(elem).find('.type_otv').html(InnerHtml);
            $(elem).find('span').removeClass(removeIcon).addClass(addIcons);
            $(elem).find('span').css('color',color);
        }
        switch (type) {
            case 1:
                changePrevie(elem,'questionNumber_NotAnswered','questionNumber_Answered','Ответ принят','icon-clock-24','icon-tick-24','#2699D4');
                changePrevie(elemModal,'questionModals_Notanswered','questionModals_Answered','Ответ принят','icon-warning-24','icon-tick-24','#2699D4');
                break;
            case 2:
                changePrevie(elem,'questionNumber_Answered','questionNumber_NotAnswered','Ожидает ответа','icon-tick-24','icon-clock-24','#ABBCD1');
                changePrevie(elemModal,'questionModals_Answered','questionModals_Notanswered','Нет ответа','icon-tick-24','icon-warning-24','#F3AF52');
                break;
        }
        textModals(questions);
    }
    function textModals(questions){
        for (i=0;i< questions['questions'].length;i++){
            if(!questions['questions'][i]['isAnswered']) {
                $('.header_modalText').css('display','block');
                break;
            }else {
                $('.header_modalText').css('display','none');
            }
        }
    }
    testWorker.prototype.Sorted = function (){
        $('#dragStartChronology').sortable({
            group:{
                name:'shared',
                put: false
            },
            sort:false,
            animation: 150
        });
        $('#dropZoneChronology').sortable({
            group: 'shared',
            animation: 150,
            ghostClass:'ghostDrag',
            filter:'js-remove'
        });

    }

    testWorker.prototype.timer = function () {
        let circle = document.querySelector('.progress-ring-circle');
        let radius = circle.r.baseVal.value;
        let circumference = 2*Math.PI*radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        let timerId = null;
        let newDate = new Date(this.$test['start']);
        const deadline = new Date(newDate.getFullYear(), newDate.getMonth(),newDate.getDate(),newDate.getHours()+2,newDate.getMinutes(),newDate.getSeconds());
        function countdownTimer() {
            const diff = deadline.getTime() - new Date().getTime();
            let offset = circumference - diff/7200000 * circumference;
            circle.style.strokeDashoffset = offset;
            if (diff <= 0) {
                $('#iconsBackToTest').css('display','none');
                $('#backToTests').css('display','none');
                $('#exampleModal').attr('data-backdrop', 'static');
                $('#exampleModal').attr('data-keyboard', 'false');
                $("#exampleModal").modal('show');
                $('.header_modalText').html('Время прохождение теста истекло !');
            }
            const hours = diff > 0 ? Math.floor(diff / 1000 / 60 / 60) % 24 : 0;
            const minutes = diff > 0 ? Math.floor(diff / 1000 / 60) % 60 : 0;
            const seconds = diff > 0 ? Math.floor(diff / 1000) % 60 : 0;
            $hours.textContent = hours < 10 ? '0' + hours : hours;
            $minutes.textContent = minutes < 10 ? '0' + minutes : minutes;
            $seconds.textContent = seconds < 10 ? '0' + seconds : seconds;
        }

        const $hours = document.querySelector('.timer__hours');
        const $minutes = document.querySelector('.timer__minutes');
        const $seconds = document.querySelector('.timer__seconds');

        countdownTimer();

        timerId = setInterval(countdownTimer, 1000);
    }
    testWorker.prototype.getQuestionNumbers = function (question_index) {
        let question_number = 0;
        let current_question = null;
        for (let i = 0; i < question_index+1; i++) {
            current_question = this.$test['questions'][i];
            question_number += current_question['question_form'] == 'question_group' ? current_question['questions'].length : 1;
        }
        return current_question['question_form'] == 'question_group' ? `${question_number-current_question['questions'].length+1}-${question_number}` : `${question_number}`
    }
    testWorker.prototype.storeAnswers = function (answers) {
        let self = this;
        answers.forEach(function (answer) {
           let answer_id = self.$test['user_answers'].findIndex((answer_) => answer_['question_id'] == answer['question_id'])
           if (answer_id != -1) self.$test['user_answers'][answer_id] = answer
           else self.$test['user_answers'].push(answer)
        });
    }
    testWorker.prototype.searchAnswer = function (question_id) {
        return this.$test['user_answers'].find((answer) => answer['question_id'] == question_id)
    }

    function searchOptionAnswer(user_answer, option_id) {
        if (user_answer) return user_answer['answer'].find((option) => option['option_id'] == option_id)
    }
    function isSelectedOption(user_answer, option_id) {
        let option = searchOptionAnswer(user_answer, option_id)
        if (option) {
            if ((option['selected'] == "true") || (option['selected'] == true)) return true;
            else return false;
        }
    }
    function getUserAnswer(user_answer) {
        if (user_answer) return !!(user_answer['answer'][0]['answer']) ? user_answer['answer'][0]['answer'] : '';
        else return '';
    }
    function getRelated(question, user_answer, option_id) {
        if (user_answer) {
            let relation = user_answer['answer'].find((_relation) => _relation['option_id'] == option_id)
            if (question) {
                let answer = question['answers'].find((quest_answer) => quest_answer['id'] == relation['answer_id'])
                if (answer) return answer
            }
        }
    }
    function getOption(question, option_id) {
        return question['options'].find((option) => option['id'] == option_id)
    }
    function getAnswer(question, answer_id) {
        return question['answers'].find((answer) => answer['id'] == answer_id)
    }

    let logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };


    $.fn[pluginName] = function (method, args) {
        let result;

        this.each(function () {
            let _this = $.data(this, pluginName);

            if (typeof method === 'string') {

                if (!_this) {
                    logError('Не инициализирован, не может вызвать метод : ' + method);
                } else if (!$.isFunction(_this[method]) || method.charAt(0) === '_') {
                    logError('Нет такого метода : ' + method);
                } else {
                    if (!(args instanceof Array)) {
                        args = [args];
                    }
                    result = _this[method].apply(_this, args);
                }

            } else {
                $.data(this, pluginName, new testWorker(this, $.extend(true, {}, method)));
            }
        });

        return result || this;
    };

})(jQuery, window, document);

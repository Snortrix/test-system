@extends('adminlte::page')

@section('title', 'РосНОУ. Тестирование')
@section('adminlte_css')
    @stack('css')
    <link rel="stylesheet" href="{{asset('css/test-design.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset('css/portal-ui.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset('css/icons.css')}}" type="text/css">
    <link rel="stylesheet" href="/css/katex.min.css" type="text/css">
@endsection

@section('content_header')

    <div class="container body indents">
        <h3 class="h3_header" style="padding: 0">Внутренние вступительные испытания</h3>
    </div>
@endsection

@section('content')
    @include('tests.modal.TestEnd')
    <div class="container body indents" id="test_body" style="display:flex;position: relative;min-height: 360px;">
        <div class="adaptive_mobile_questionBody" id="questionBody_loader" style="display: flex;">
            <div class="quest_body">
                <div class="row headInfTest">
                    <div class="col d-flex justify-content-start  p-0  align-items-baseline flex-column" style="gap: 8px">
                        <h3 class="h3_header_onTestBody">{{$test_body -> name}}</h3>
                        <p class="textNumber_question m-0">Вопрос: <span id="questionNumber"> 1</span> из {{$test_body -> question_count}}</p>
                    </div>
                    <div class="col buttonsTimer p-0">
                        <div class = "timerAndProgressbar">
                            <div style="margin-right: 12px">
                                <svg class="progress-ring" width="28px" height="28px">
                                    <circle class = "progress-ring-circle" r="12" width="4" cx="14" cy="14" fill="white" stroke-width="4" stroke-linecap="round" stroke="#2699D4"></circle>
                                </svg>
                            </div>
                            <div class="timerTest">
                                <div class="timer__item timer__hours"></div>
                                <div class="timer__item timer__minutes"></div>
                                <div class="timer__item timer__seconds"></div>
                            </div>
                        </div>
                        <button class="primary_button" data-toggle="modal" onclick="tw.testWorker('modalsButton')"  id="ButtonModals"><span id="ButtonModalsLoad"></span>Завершить <span class="zavershit_test_none">тест</span></button>
                    </div>
                </div>
                <div class="row p-4 m-2 quest_body_row">
                    <div class="absolute_white_podloshka_loader"></div>
                    <div class = "question p-0 m-0" id="questionBody">
                        <div class="d-flex justify-content-center align-items-baseline">
                            <div class="loader"></div>
                        </div>
                    </div>
                </div>
                <div class="buttons_panel" style="margin-left: 32px">
                    <button class="secondary_button" style="margin-right: 16px;display: none" id="prevButton" onclick="tw.testWorker('prevQuestion')"><span id="prevButtonsLoad"></span>Предыдущий вопрос</button>
                    <button class="secondary_button" id ="nextButton" onclick="tw.testWorker('nextQuestion')"><span id="nextButtonsLoad"></span>Следующий вопрос</button>
                </div>
            </div>
        </div>
        <div class="list_questions">
            <div class="list_questionsScrollbar" id="listQuestions"></div>
        </div>
    </div>
@endsection

@section('js')
    <script src="/js/katex.min.js"></script>
    <script src="/js/auto-render.min.js"></script>
    <script src="{{asset('/js/testWorker.js')}}"></script>
    <script src="/js/Sortable.js"></script>
    <script src="/js/jquery-sortable.js"></script>

    <script>

        let jsonTest = @json($test_body);
        let tw = $('#test_body').testWorker();
        tw.testWorker('init', jsonTest);

        function deletePlaceholder(){
            if ($('#dropZoneChronology').children().length == 2 && $('.dropZoneChronology').children('.placeholderQuestChronology')) $('.dropZoneChronology').children('.placeholderQuestChronology').remove();
        }
        function inputAnswer(inputAnswer){
            let input = document.querySelector(inputAnswer)
            input.addEventListener('input',event => {
                input.value = input.value.substring(0, 100);
            });

            input.addEventListener('input',event => {
                let countRow = document.querySelector(".count_row");
                let length = input.value.length
                countRow.innerHTML = length;
            });

        }
        function DropDrag (param){
            let drop = $('.dropZone').find('.drop_elem');
            let width = $('.border_dashed').width();
            document.querySelector('.dragStart_display').style.display = 'block';
            $.each(drop, function (key,elem) {
                if (param){
                    $(elem).remove();
                }else{
                    elem.style.width = width + 32 + 'px';
                    $('.dragStart').append(elem);
                }
            })
            $.each($('.dropZone'), function (key,dropZone){
                if (dropZone.children.length == 0){
                    $(dropZone).parents('.border_dashed').find('.drop_Zone_Info').css('height','64px');
                    $(dropZone).html(`<p class="placeholderQuest">Перетащите сюда подходящий ответ</p>`);
                }
            })
        }
    </script>
@endsection

@extends('adminlte::page')

@section('title', 'РосНОУ. Тестирование')
@section('adminlte_css')
    @stack('css')
    <link rel="stylesheet" href="{{asset('css/test-design.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset('css/icons.css')}}" type="text/css">
@endsection
@section('content_header')
<div class="container body indents"  style="padding: 0">
        <h3 class="h3_header">Внутренние вступительные испытания</h3>
</div>
@endsection

@section('content')
    <div class="body container indents">
        <div class="row indents_back_pretest">
            <h3 class="h3_header">{{$test->name}}</h3>
            <div class="row" style="margin-top: 20px;align-items: center;">
                <div class="information" style="display: flex;justify-content: start">
                    <div class="d-flex justify-content-start">
                        <span class="icon-info-32" style="color: #2699D4;font-size: 32px;padding-top: 5px"></span>
                        <p>Тестирование можно проходить с <b>8:00</b> по <b>20:00 МСК</b> (GMT+3). Желательно не использовать для прохождения тестирования
                            мобильные устройства, возможно некорректное отображение вопросов.
                            <br><br>
                            При готовности нажмите кнопку <b>Перейти к тесту.</b> С этого момента начнется отсчет времени,
                            таймер расположен в правом верхнем углу экрана. В вашем распоряжении <b>2 часа.</b> При прохождении внимательно
                            читайте вопросы и отвечайте на заданные вопросы. В правой части экрана расположена навигация по вопросам.
                                    Они могут иметь состояния <b>Ответ принят</b> или <b>Ожидает ответа</b>.
                            <br><br>
                            Если Вы уверены в правильности и полноте Ваших ответов нажмите на кнопку <b>Завершить тест.</b>
                        </p>
                    </div>
                </div>
                <div class="col sidebar_position" style="padding-right: 0px">
                    <div class="sidebar_information">
                        <div class="icons-pretest"><span class="icon-question-mark-24 icons-pretest" style="font-size: 24px"></span></div>
                        <div class="sidebar_informationText">
                            <p>Количество <span class="kol-vo_MediaScreen" style="padding-left: 4px"> вопросов:</span></p>
                            <p>{{$test->question_count}} вопросов</p>
                        </div>
                    </div>
                    <div class="sidebar_information">
                        <div class="icons-pretest"><span class="icon-score-24" style="font-size: 24px"></span></div>
                        <div class="sidebar_informationText">
                            <p>Мин. баллов:</p>
                            <p>{{$test->min_score}} баллов</p>
                        </div>
                    </div>
                    <div class="sidebar_information">
                        <div class="icons-pretest"><span class="icon-calendar-24" style="font-size: 24px"></span></div>
                        <div class="sidebar_informationText">
                            <p>Срок сдачи:</p>
                            <p>23.08.2023</p>
                        </div>
                    </div>
                    <div class="sidebar_information">
                        <div class="icons-pretest"><span class="icon-clock-24" style="font-size: 24px"></span></div>
                        <div class="sidebar_informationText">
                            <p>{{ is_null($time_left) ? 'Отведенное' : 'Оставшееся' }} время:</p>
                            <p>{{ is_null($time_left) ? '2 часа' : $time_left }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons_panel" style="width: 100%;">
                <div class="d-flex flex-row align-items-center flex-wrap" style="gap: 16px">
                <button class="secondary_button"  onclick="window.location.href='{{ route("test.index") }}'">Назад</button>
            @if (!is_null($notDonedTest))
                <button class="primary_button_pretest" disabled>Перейти к тесту</button><p class="pretest_disabled">У вас есть незавершенный тест: <b>{{$notDonedTest['test']['name']}}</b></p></div>
            @elseif ($isAllowedToSolveByTime)
                <button class="primary_button_pretest" onclick="window.location.href='{{route("test.show", $test['id'])}}'">Перейти к тесту</button>
            @else
                <button class="primary_button_pretest" disabled>Перейти к тесту</button><p class="pretest_disabled">Прохождение тестирования доступно с <b>8:00</b> по <b>20:00 МСК</b> (GMT+3).</p></div>
            @endif
            </div>
        </div>
    </div>
@endsection

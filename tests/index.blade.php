@extends('adminlte::page')

@section('title', 'РосНОУ. Тестирование')
@section('adminlte_css')
    @stack('css')
    <link rel="stylesheet" href="{{asset('css/test-design.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset('css/icons.css')}}" type="text/css">
@endsection
@section('content_header')
    <div class="container body indents" style="padding: 0">
            <h3 class="h3_header">Внутренние вступительные испытания</h3>
    </div>
@endsection

@section('content')
        <div class="container body indents_back" style="padding-top: 24px">
            <h3 class="h3_header_onTestBody">Ваши тесты</h3>
            <p class="w-75">Для прохождения теста нажмите кнопку Начать тестирование. Обратите внимание,
                что время на тест ограничено и Вам дано ровно 2 часа. Проходить тесты можно с 8:00 до 20:00 МСК.</p>
            <table class="table_test w-100">
                <thead>
                <th>Предмет</th>
                <th>Вопросы</th>
                <th>Мин. баллов</th>
                <th>Срок сдачи</th>
                <th>Результат</th>
                <th></th>
                </thead>
                <tbody>
                @foreach($test_files as $test_file)
                    <tr>
                        <td style="font-weight: 500">{{$test_file['name']}}</td>
                        <td>{{$test_file['question_count']}} вопросов</td>
                        <td>{{$test_file['min_score']}} б.</td>
                        <td>
                            <div style="display: flex">
                                <div style="display: flex"><span class="icon-calendar-24" style="font-size: 24px; padding-right: 24px;color: #ABBCD1"></span></div>
                                <div>
                                    23.08.2023
                                </div>
                            </div>
                        </td>
                        @if (!is_null($test_file['passes']))
                            <td style="color: #2699D4;font-weight: 500">{{$test_file['passes']['score']}} баллов</td>
                        @else
                            <td style="color: #2699D4">-</td>
                        @endif
                        <td>
                            <button class="secondary_button"  onclick="window.location.href='{{ route("test.pretest.index", $test_file['id']) }}'">Начать <span class="kol-vo_MediaScreen"> тестирование</span></button>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
@endsection

{{--@section('js')--}}
{{--    <script src="{{asset('js/app.js')}}"></script>-- заделка на katex}}
{{--@endsection--}}

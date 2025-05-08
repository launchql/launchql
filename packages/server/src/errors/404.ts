export default `
<html lang="en">

<head>
    <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE">
    <META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
    <META NAME="GOOGLEBOT" CONTENT="NOARCHIVE">
    <title>Not Found</title>

    <link href='//fonts.googleapis.com/css2?family=Fjalla+One&display=swap' rel='stylesheet' type='text/css'>

    <style type="text/css">
        .fade-in-cls {
            -webkit-animation: fade-in 2s 0.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
            -moz-animation: fade-in 2s 0.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: fade-in 2s 0.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
            -webkit-transform: translateY(10px);
            -moz-transform: translateY(10px);
            -o-transform: translateY(10px);
            transform: translateY(10px);
            -webkit-opacity: 0;
            -moz-opacity: 0;
            opacity: 0;
        }

        @-webkit-keyframes fade-in {
            100% {
                -webkit-transform: translateY(0px);
                -moz-transform: translateY(0px);
                -o-transform: translateY(0px);
                transform: translateY(0px);
                -webkit-opacity: 1;
                -moz-opacity: 1;
                opacity: 1;
            }
        }

        @-moz-keyframes fade-in {
            100% {
                -webkit-transform: translateY(0px);
                -moz-transform: translateY(0px);
                -o-transform: translateY(0px);
                transform: translateY(0px);
                -webkit-opacity: 1;
                -moz-opacity: 1;
                opacity: 1;
            }
        }

        @keyframes fade-in {
            100% {
                -webkit-transform: translateY(0px);
                -moz-transform: translateY(0px);
                -o-transform: translateY(0px);
                transform: translateY(0px);
                -webkit-opacity: 1;
                -moz-opacity: 1;
                opacity: 1;
            }
        }

        .time {

            -webkit-animation: ckw 15s infinite;
            /* Safari 4+ */
            -moz-animation: ckw 15s infinite;
            /* Fx 5+ */
            -o-animation: ckw 15s infinite;
            /* Opera 12+ */
            animation: ckw 15s infinite;
            /* IE 10+, Fx 29+ */
            -webkit-animation-timing-function: linear;
            /* Chrome, Safari, Opera */
            animation-timing-function: linear;
            transform-origin: 50% 50%;
            display: inline-block;
            /* <--- */
        }

        @keyframes ckw {
            0% {
                transform: rotate(0deg);
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -o-transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -o-transform: rotate(360deg);
            }
        }

        @-webkit-keyframes ckw {
            0% {
                transform: rotate(0deg);
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -o-transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -o-transform: rotate(360deg);
            }
        }

        @-moz-keyframes ckw {
            0% {
                transform: rotate(0deg);
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -o-transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -o-transform: rotate(360deg);
            }
        }

        body {
            background-color: #dde7e9;
            color: #01A1FF;
            font-family: 'Fjalla One', sans-serif;
            position: relative;
            margin: 0px;
        }

        section {
            width: 100%;
            height: 100%;
            position: absolute;
        }

        article {
            display: table;
            width: 100%;
            height: 100%;
        }

        /* .border-top {
            width: 95px;
            background-color: #fff;
            height: 2px;
            display: inline-block;
            margin: 0px auto;
        } */

        .vcntr {
            display: table-cell;
            height: 100%;
            width: 100%;
            vertical-align: middle;
        }

        .logo {
            width: 100px;
            margin: 10px auto;
            display: block;
        }

        h1 {
            font-size: 21px;
            line-height: 32px;
            margin-bottom: 0px;
            margin-top: 28px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        p {
            font-size: 16px;
            line-height: 23px;
            margin-bottom: 8px;
            margin-top: 6px;
        }

        .textc {
            text-align: center;
        }

        @media only screen and (max-width:480px) {
            .logo {
                width: 100px;
            }
        }
    </style>
</head>

<body class="">
    <section>
        <article>
            <div class="vcntr">
                <div class="logo fade-in-cls">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.95 61.24"><path d="M16.36 43.47a14.56 14.56 0 01-8.79 0A11.16 11.16 0 011 38.34a8.83 8.83 0 01-.45-1A8.09 8.09 0 01.76 31a10.08 10.08 0 013.68-4.17 6.23 6.23 0 01-.24-.65A8.17 8.17 0 014.68 20a10.47 10.47 0 014.53-4.53 13.25 13.25 0 012.12-.9 12.35 12.35 0 012.5-7.45A17.35 17.35 0 0122.7 1a22.38 22.38 0 0113.48 0 17.07 17.07 0 019.42 6.9 18.75 18.75 0 019.8.4 14 14 0 018.29 6.46 10.17 10.17 0 01.78 1.83 10 10 0 01-.59 7.56 13.05 13.05 0 01-5.64 5.64A17.05 17.05 0 0155.4 31l-39 12.45zM64.92 36q-1.05 4.48-10.54 7.63l-.36.12L15 56.22a9.87 9.87 0 01-1.91.41C6.88 57.55 2.16 54.78 0 51.24a8.2 8.2 0 00.56 3.2 7.45 7.45 0 00.45 1 11.09 11.09 0 006.56 5.13 14.64 14.64 0 008.79 0l39-12.45a17.07 17.07 0 002.84-1.2 13 13 0 005.64-5.63 10.19 10.19 0 001-5.27zm0-8.59q-1.05 4.49-10.54 7.64l-.36.12L15 47.64a9.84 9.84 0 01-1.91.4C6.88 49 2.16 46.19 0 42.65a8.28 8.28 0 00.56 3.21 8.83 8.83 0 00.45 1A11.16 11.16 0 007.57 52a14.64 14.64 0 008.79 0l39-12.45a17.05 17.05 0 002.84-1.19 13.05 13.05 0 005.64-5.64 10.17 10.17 0 001-5.27zM9 39.13a10.11 10.11 0 006 0l39-12.45a12.25 12.25 0 002.06-.87 8.52 8.52 0 003.7-3.62 5.52 5.52 0 00.37-4.19 6.6 6.6 0 00-.46-1A9.57 9.57 0 0054 12.68a14.17 14.17 0 00-8.48 0l-.16.05-.2.07-2 .69-.84-2c-.07-.16-.12-.27-.14-.33l-.18-.27a12.26 12.26 0 00-7.2-5.51 17.85 17.85 0 00-10.73 0 12.81 12.81 0 00-6.56 4.44 7.58 7.58 0 00-1.47 6l.45 2.29-2.31.4c-.27 0-.5.09-.68.13s-.46.12-.66.19a8.31 8.31 0 00-1.47.62A5.88 5.88 0 008.78 22a3.71 3.71 0 00-.24 2.79 3.77 3.77 0 00.31.7c.07.13.15.26.24.4.1.14.19.27.29.39l2 2.44-3 1.13a9.92 9.92 0 00-.94.44 5.79 5.79 0 00-2.59 2.57 3.57 3.57 0 00-.1 2.83 4.9 4.9 0 00.22.48 6.69 6.69 0 003.92 3z" fill="#01a1ff"/></svg>

                </div>
                <div class="textc">
                    <h1>Not Found</h1>
                    <p>We’re really sorry about that. The service you were looking for doesn't exist.</p>
                </div>
            </div>
        </article>
    </section>
</body>

</html>
`;

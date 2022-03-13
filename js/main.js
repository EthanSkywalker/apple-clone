// 1 - 전체 높이에 5배를 곱해준다. (setLayout)
// 2 - 현재 위치에 대한 스크롤 위치를 알 수 있는 변수를 생성한다. (yOffset)
// 3 - Scene 의 위치(index)를 알 수 있는 함수를 생성한다. (4개의 컷 중에서의 Scene 위치 -> scrollLoop)
// 3.1 - prevScrollHeight는 이전 Scene 의 높이 값을 가지고 있는데, 현재 Scene 의 높이를 현재 스크롤 위치로 계산하여 Index를 변경하며 Scene을 파악 
// 4 - Scene 에서의 스크롤 위치를 알 수 있는 메소드를 생성한다. (playAnimation 확인)
// 5 - Scene 애서의 스크롤 범위를 알 수 있는 (0~1) 메소드를 생성한다. (calcValues)
// 6 - calcValues 를 통히여 opacity 와 translate 값 등을 변경한다.
// 7 - html에 canavs 를 그린 후 setCanvasImages 에서 이미지를 셋팅한다.
// 8 - 3번 section 의 canvas를 그린다
// 8.1 - canvas 의 가로, 세로의 비율을 구한뒤 비율에 맞게 scale 을 조정한다.

(() => {

    let yOffset = 0;                                        // pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0;                               // 현재 스크롤 위치(yOffset) 보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
    let currentScene = 0;                                   // 현재 활성화 된(눈 앞에 보고 있는) 씬 (scroll-section) index
    let enterNewScene = false;                              // 새로운 Scene 이 시작 된 순간

    let acc = 0.1;
    let delayedYOffset = 0;	// 스크롤의 Y 위치
    let rafId;
    let rafState;


    // 신 정보 배열 생성
    const sceneInfo = [
        {
            // 0
            type: 'sticky',
            heightNum: 5,                           // 브라우저 높이의 5배로 scrollheight 세팅
            scrollHeight: 0,                        // 높이를 고정 값으로 하지 않는 이유는 창 사이트의 변경에도 대응해야 하기 때문에 각 디바이스의 높이는 다 다르니까. (moblie, pc 모두 지원하기 위해.)
            objs: {
                container: document.querySelector('#scroll-section-0'),
                messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                canvas: document.querySelector('#video-canvas-0'),
                context: document.querySelector('#video-canvas-0').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 300,						                    // 이미지 갯수
                imageSequence: [0, 299],					                    // 이미지 순서의 초기 값과 최종 값
                canvas_opacity: [1, 0, { start: 0.9, end: 1 }],
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
                messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
                messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
                messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
                messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
                messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
                messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
                messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
                messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
                messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
                messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
                messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
                messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
            }
        },
        {
            // 1
            type: 'normal',
            // heightNum: 5, // type normal에서는 필요 없음
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-1'),
                content: document.querySelector('#scroll-section-1 .description')
            }
        },
        {
            // 2
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-2'),
                messageA: document.querySelector('#scroll-section-2 .a'),
                messageB: document.querySelector('#scroll-section-2 .b'),
                messageC: document.querySelector('#scroll-section-2 .c'),
                pinB: document.querySelector('#scroll-section-2 .b .pin'),
                pinC: document.querySelector('#scroll-section-2 .c .pin'),
                canvas: document.querySelector('#video-canvas-1'),
                context: document.querySelector('#video-canvas-1').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 960,						                    // 이미지 갯수
                imageSequence: [0, 959],					                    // 이미지 순서의 초기 값과 최종 값
                canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
                canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }],
                messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
                messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
                messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
                messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
                messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
                messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
                messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
                messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
                messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
                messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
                messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
                pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
                pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
                pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
                pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
                pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }]
            }
        },
        {
            // 3
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-3'),
                canvasCaption: document.querySelector('.canvas-caption'),
                canvas: document.querySelector('.image-blend-canvas'),
                context: document.querySelector('.image-blend-canvas').getContext('2d'),
                imagesPath: [
                    './images/blend-image-1.jpg',
                    './images/blend-image-2.jpg',
                ],
                images: []
            },
            values: {
                rect1X: [0, 0, { start: 0, end: 0 }],
                rect2X: [0, 0, { start: 0, end: 0 }],
                blendHeight: [0, 0, { start: 0, end: 0 }],
                canvas_scale: [0, 0, { start: 0, end: 0 }],
                canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
                canvasCaption_translateY: [20, 0, { start: 0, end: 0 }],
                rectStartY: 0,                                              // Canvas 에니메이션이 시작되는 시점의 Y 값
            }
        }
    ];

    // 이미지를 배열에 셋팅하는 함수
    function setCanvasImages() {
        let imgElem;
        for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
            imgElem = new Image();
            imgElem.src = `./video/001/IMG_${6726 + i}.JPG`;
            sceneInfo[0].objs.videoImages.push(imgElem);
        }

        let imgElem2;
        for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
            imgElem2 = new Image();
            imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`;
            sceneInfo[2].objs.videoImages.push(imgElem2);
        }

        let imgElem3;
        for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
            imgElem3 = new Image();
            imgElem3.src = sceneInfo[3].objs.imagesPath[i];
            sceneInfo[3].objs.images.push(imgElem3);
        }
    }

    function checkMenu() {
        if (yOffset > 44) {
            document.body.classList.add('local-nav-sticky')
        } else {
            document.body.classList.remove('local-nav-sticky')
        }
    }

    // 각 스크롤 Section 높이를 세팅
    function setLayout() {
        for (let i = 0; i < sceneInfo.length; i++) {
            if (sceneInfo[i].type === 'sticky') {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;        // scrollHeight : window.innerHeight 를 통해 가져온 브라우저 높이 * heightNum (브라우저 높이 x 5)
            } else if (sceneInfo[i].type === 'normal') {
                sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
            }
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`     // 각 obj 의 container에 scrollHeight 값을 지정 
        }

        yOffset = window.pageYOffset

        // 새로고침 시 페이지 세팅
        // 페이지 토탈 높이의 크기가 현재 스크롤 위치보다 크거나 같다면.
        let totalScrollHeight = 0;
        for (let i = 0; i < sceneInfo.length; i++) {
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if (totalScrollHeight >= yOffset) {
                currentScene = i;
                break
            }
        }
        document.body.setAttribute('id', `show-scene-${currentScene}`);


        // 컵이 이동 canvas scale 을 통한 중앙 정렬. css 파일도 참고 필요 (sticky-elem-canvas canvas)
        const heightRatio = window.innerHeight / 1080;
        sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`
        sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`
    }


    function calcValues(values, currentYoffset) {
        let rv; // retrun value

        const scrollHeight = sceneInfo[currentScene].scrollHeight;

        // 현재 Scene 에서 스크롤 된 범위를 비율로 구하기
        // 현재 Scene 에서의 스크롤 위치 / Scene 전체의 높이 
        const scrollRatio = currentYoffset / scrollHeight

        if (values.length === 3) {
            // start ~ end 사이에 애니메이션 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart;


            if (currentYoffset >= partScrollStart && currentYoffset <= partScrollEnd) {
                rv = (currentYoffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0]
            } else if (currentYoffset < partScrollStart) {
                rv = values[0];
            } else if (currentYoffset > partScrollEnd) {
                rv = values[1];
            }
        } else {
            // value[1] 은 끝값 value[0] 은 시작값. 끝 값에서 시작값을 빼면 범위만 나온다. 
            // ex 900 - 200 = 700 즉 0 ~ 700 범위에서 만 움직인다. 우리는 범위가 700 인거지 200 부터 시작해서 900 에서 끝나야 하는데 0 ~ 700 까지만 움직이게 된다.
            // 그래서 (끝 값 - 시작 값) + 시작 값 을 해주면 200 ~ 900 까지 움직이게 된다.

            // 스크롤 비율 * (900 - 200) + 200                 // 스크롤 비율 * (900 - 200)
            // 0.0 * 700 + 200 = 200                        0.0 * 700 = 0
            // 0.1 * 700 + 200 = 270                        0.1 * 700 = 70
            // 0.2 * 700 + 200 = 340                        0.2 * 700 = 140
            // 0.3 * 700 + 200 = 410                        0.3 * 700 = 210
            // 0.4 * 700 + 200 = 480                        0.4 * 700 = 280
            // 0.5 * 700 + 200 = 550                        0.5 * 700 = 350
            // 0.6 * 700 + 200 = 620                        0.6 * 700 = 420
            // 0.7 * 700 + 200 = 690                        0.7 * 700 = 490
            // 0.8 * 700 + 200 = 760                        0.8 * 700 = 560
            // 0.9 * 700 + 200 = 830                        0.9 * 700 = 630
            // 1.0 * 700 + 200 = 900                        1.0 * 700 = 700
            rv = scrollRatio * (values[1] - values[0]) + values[0]
        }
        return rv;
    }


    function playAnimation() {
        const objs = sceneInfo[currentScene].objs;                      // currentScene === sceneIndex 
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset - prevScrollHeight;              // 현재 scene 에서의 스크롤 위치 
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;              // 현재 Scene 의 스크롤 비율

        switch (currentScene) {
            case 0:
                // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                // objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                objs.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);



                // translate3d 는 하드웨어 가속이 보장됨. 퍼포먼스가 더 좋다. 
                if (scrollRatio <= 0.22) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.42) {
                    // in
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.62) {
                    // in
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.82) {
                    // in
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
                }

                break;


            // case 1 번은 그냥 normal scroll 이라서 따로 이벤트를 줄 것이 없으므로 뺐음.



            case 2:
                // console.log('2 play');
                // let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
                // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);

                if (scrollRatio <= 0.5) {
                    // in
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
                } else {
                    // out
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
                }

                if (scrollRatio <= 0.25) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.57) {
                    // in
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                }

                if (scrollRatio <= 0.83) {
                    // in
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                }

                //currentScene 3에서 쓰는 canvas 를 미리 그려주기 시작 - 안그러면 3번 Scene 이 됐을 때만 띡 하고 이미지가 나옴
                if (scrollRatio > 0.9) {
                    const objs = sceneInfo[3].objs;
                    const values = sceneInfo[3].values;

                    // 가로 세로 모두 꽉 차게 하기 위해 여기서 세팅(계산 필요)
                    const widthRatio = window.innerWidth / objs.canvas.width;
                    const heightRatio = window.innerHeight / objs.canvas.height;
                    let canvasScaleRatio;

                    if (widthRatio <= heightRatio) {
                        // canvas 보다 브라우저 가로가 좁을때
                        canvasScaleRatio = heightRatio;
                    } else {
                        // canavs 보다 창이 납작한 높이 일 경우
                        canvasScaleRatio = widthRatio;
                    }

                    objs.canvas.style.transform = `scale(${canvasScaleRatio})`
                    objs.context.fillStyle = 'white'
                    objs.context.drawImage(objs.images[0], 0, 0);


                    // 흰색 박스 
                    // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
                    const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;        // 스크롤 바를 제외한 너비
                    const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

                    const whiteRectWidth = recalculatedInnerWidth * 0.15;                           // 흰색 박스 크기 

                    // 왼쪽 시작위치 = 원래 canvas 크기에서(1080px) - 새로계산된 canvas 크기 / 2
                    values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;

                    // 왼쪽 밀려나야할 위치 = 왼쪽 시작위치 - 흰색 박스 크기
                    values.rect1X[1] = values.rect1X[0] - whiteRectWidth;

                    // 오른쪽 시작 위치 = 왼쪽 시작위치 + 새로계산된 canvas 크기 - 흰색 박스 크기
                    values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;

                    // 오른쪽 밀려나야할 위치 = 오른쪽 시작 위치 + 흰색 박스크기
                    values.rect2X[1] = values.rect2X[0] + whiteRectWidth;


                    // 좌우 흰색 박스 그리기
                    objs.context.fillRect(parseInt(values.rect1X), 0, parseInt(whiteRectWidth), objs.canvas.height);
                    objs.context.fillRect(parseInt(values.rect2X), 0, parseInt(whiteRectWidth), objs.canvas.height);
                }

                break;

            case 3:
                // console.log('3 play');
                let step = 0;

                // 가로 세로 모두 꽉 차게 하기 위해 여기서 세팅(계산 필요)
                // 가로와 세로의 브라우저 비율을 구하기 위한 부분
                const widthRatio = window.innerWidth / objs.canvas.width;
                const heightRatio = window.innerHeight / objs.canvas.height;
                let canvasScaleRatio;

                // console.log(window.innerWidth, objs.canvas.width, window.innerWidth / objs.canvas.width)
                // console.log(widthRatio, heightRatio)

                if (widthRatio <= heightRatio) {
                    // canvas 보다 브라우저 가로가 좁을때
                    canvasScaleRatio = heightRatio;
                } else {
                    // canavs 보다 창이 납작한 높이 일 경우
                    canvasScaleRatio = widthRatio;
                }

                // canvas 를 화면 비율에 맞게 scale 조정
                objs.canvas.style.transform = `scale(${canvasScaleRatio})`
                objs.context.fillStyle = 'white'
                objs.context.drawImage(objs.images[0], 0, 0);


                // 흰색 박스 
                // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
                const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;        // 스크롤 바를 제외한 너비
                const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

                if (!values.rectStartY) {
                    // values.rectStartY = objs.canvas.getBoundingClientRect().top     //getBoundingClientRect 화면상에 있는 오브젝트의 크기와 위치를 알 수 있는 메소드

                    // scale 이 조정 되기 전의 위치 값이 가지므로 계산이 필요.
                    // 원래 canvas 의 높이 - scale 조정 된 canvas 의 높이를 뺀 후 / 2 를 한다.
                    // 2 를 나누는 이유는 위, 아래의 줄어든 값이 있기 때문에.
                    values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;

                    values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight
                    values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight
                    values.rect1X[2].end = values.rectStartY / scrollHeight
                    values.rect2X[2].end = values.rectStartY / scrollHeight
                }


                const whiteRectWidth = recalculatedInnerWidth * 0.15;                           // 흰색 박스 크기 

                values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;            // 전체 canvas 크기에서 화면에서 보여주는 canvas 크기 만큼 뺀 다음 2로 나누면 양쪽 크기가 나온다.
                values.rect1X[1] = values.rect1X[0] - whiteRectWidth;                           // 왼쪽 흰색 박스가 밀려나는 위치 (왼쪽 방향으로)
                values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;  // 오른쪽 박스가 시작 되는 위치 (모니터에 보여지는 canvas 의 내부크기 - 흰색박스) 
                values.rect2X[1] = values.rect2X[0] + whiteRectWidth;                           // 오른쪽 박스가 밀려나는 위치 (오른쪽 방향으로)

                // 스크롤 할 때 좌우 흰색 박스 그리기
                objs.context.fillRect(
                    parseInt(calcValues(values.rect1X, currentYOffset)),
                    0,
                    parseInt(whiteRectWidth),
                    objs.canvas.height
                );
                objs.context.fillRect(
                    parseInt(calcValues(values.rect2X, currentYOffset)),
                    0,
                    parseInt(whiteRectWidth),
                    objs.canvas.height
                );

                // canvas가 브라우저 상단에 닿지 않았다면.
                if (scrollRatio < values.rect1X[2].end) {
                    step = 1;
                    objs.canvas.classList.remove('sticky');
                } else {
                    step = 2;
                    // 이미지 블렌드

                    values.blendHeight[0] = 0;
                    values.blendHeight[1] = objs.canvas.height;
                    values.blendHeight[2].start = values.rect1X[2].end;
                    values.blendHeight[2].end = values.blendHeight[2].start + 0.2;
                    const blendHeight = calcValues(values.blendHeight, currentYOffset);

                    // 2번 이미지
                    objs.context.drawImage(objs.images[1],
                        //  source setting
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight,
                        // canvas setting
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight
                    );

                    objs.canvas.classList.add('sticky');
                    objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;


                    objs.canvas.classList.add('sticky');
                    // canvas scale 을 조정했으므로 윗부분에 여백이 남음 해당 식을 통해서 canvas 를 올려줌
                    objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`

                    if (scrollRatio > values.blendHeight[2].end) {
                        values.canvas_scale[0] = canvasScaleRatio;
                        values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width);
                        values.canvas_scale[2].start = values.blendHeight[2].end;
                        values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

                        objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)})`;
                        objs.canvas.style.marginTop = 0;
                    }

                    if (scrollRatio > values.canvas_scale[2].end
                        && values.canvas_scale[2].end > 0) {
                        objs.canvas.classList.remove('sticky');
                        objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

                        values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
                        values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
                        values.canvasCaption_translateY[2].start = values.canvasCaption_opacity[2].start;
                        values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].end;
                        objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset);
                        objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(values.canvasCaption_translateY, currentYOffset)}%, 0)`;
                    } else {
                        objs.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
                    }
                }

                break;
        }
    }

    // Scene 위치 확인.
    // currentScene 컨트롤
    function scrollLoop() {
        //prevScrollHeight === "이전 Scene의 높이"
        enterNewScene = false;
        prevScrollHeight = 0;                                                               // 값을 누적 시키지 않고 초기화 (스크롤 할 때마다 스크롤 값이 더해지면 정상동작하지 않음 )
        for (let i = 0; i < currentScene; i++) {
            prevScrollHeight += sceneInfo[i].scrollHeight;
        }

        // Scene 변경 조건문 Start
        // 이전 스크롤 높이보다 현재 스크롤 높이가 크면 Scene Index + 1
        if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            enterNewScene = true
            currentScene++;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }

        // 이전 스크롤 높이보다 현재 스크롤 높이가 작으면 Scene Index - 1
        if (delayedYOffset < prevScrollHeight) {
            enterNewScene = true
            if (currentScene === 0) return 0;                                               // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일 및 여러 브라우저 대응)
            currentScene--;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }


        // Scene 이 변경되는 순간에는 계산 오차로 인해 실행하지 않고 패스
        if (enterNewScene) return;
        playAnimation();
    }

    function loop() {
        // 현재지점 + (목표지점 - 현재지점) x 0.1 (가속도 적용)
        delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;


        // Scene 이 변경되는 순간에는 계산 오차로 인해 실행하지 않고 패스
        if (!enterNewScene) {
            // Scene 이 1번일 경우
            if (currentScene === 0 || currentScene === 2) {
                const currentYOffset = delayedYOffset - prevScrollHeight;
                const objs = sceneInfo[currentScene].objs;
                const values = sceneInfo[currentScene].values;

                let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                if (objs.videoImages[sequence]) {
                    objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                }
            }
        }

        rafId = requestAnimationFrame(loop);

        if (Math.abs(yOffset - delayedYOffset) < 1) {
            cancelAnimationFrame(rafId);
            rafState = false;
        }
    }


    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset                                                        // 현재 스크롤 한 위치를 알 수 있다.
        scrollLoop();
        checkMenu();

        if (!rafState) {
            rafId = requestAnimationFrame(loop);
            rafState = true;
        }
    })



    window.addEventListener('load', () => {
        setLayout();                                                                        // 이미지 리소스 까지 다 받은 후 작동
        sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);        // 문서를 처음 호출했을 때 바로 canvas에 이미지가 셋팅 되도록
    })

    window.addEventListener('resize', () => {
        if (windiw.innerWidth > 600) {
            // resize 이벤트가 발생하면 높이를 유연하게 변경하기 위한 메소드.
            setLayout();
        }
        // 4번 Scnce 의 위치를 시작위치를 초기화 해줌으로써 계산되는 것을 초기화 해준다.
        // 왜냐하면 rectStartY 와 연관된 계산이 많으므로
        sceneInfo[3].values.rectStartY = 0;
    })

    window.addEventListener('orientationChange', setLayout());

    setCanvasImages();
})();
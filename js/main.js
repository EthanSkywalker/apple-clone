// 1 - 전체 높이에 5배를 곱해준다. (setLayout)
// 2 - 현재 위치에 대한 스크롤 위치를 알 수 있는 변수를 생성한다. (yOffset)
// 3 - Scene 의 위치(index)를 알 수 있는 함수를 생성한다. (4개의 컷 중에서의 Scene 위치 -> scrollLoop)
// 3.1 - prevScrollHeight는 이전 Scene 의 높이 값을 가지고 있는데, 현재 Scene 의 높이를 현재 스크롤 위치로 계산하여 Index를 변경하며 Scene을 파악 
// 4 - Scene 에서의 스크롤 위치를 알 수 있는 메소드를 생성한다. (playAnimation 확인)
// 5 - Scene 애서의 스크롤 범위를 알 수 있는 (0~1) 메소드를 생성한다. (calcValues)

(() => {

    let yOffset = 0;                                        // pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0;                               // 현재 스크롤 위치(yOffset) 보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
    let currentScene = 0;                                   // 현재 활성화 된(눈 앞에 보고 있는) 씬 (scroll-section) index
    let enterNewScene = false;                              // 새로운 Scene 이 시작 된 순간


    // 신 정보 배열 생성
    const sceneInfo = [
        {
            // 0
            type: 'sticky',
            heightNum: 5,                                   // 브라우저 높이의 5배로 scrollheight 세팅
            scrollHeight: 0,                                // 높이를 고정 값으로 하지 않는 이유는 창 사이트의 변경에도 대응해야 하기 때문에 각 디바이스의 높이는 다 다르니까. (moblie, pc 모두 지원하기 위해.)
            objs: {
                container: document.querySelector('#scroll-section-0'),  // html 에 기재 된 Section id
                messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                messageD: document.querySelector('#scroll-section-0 .main-message.d'),
            },
            values: {
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
                messageB_opacity_out: [1, 0, { start: 0.1, end: 0.2 }],
            }
        },
        {
            // 1
            type: 'normal',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-1')
            }
        },
        {
            // 2
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-2')
            }
        },
        {
            // 3
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-3')
            }
        }
    ]

    // 각 스크롤 Section 높이를 세팅
    function setLayout() {
        for (let i = 0; i < sceneInfo.length; i++) {
            sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;        // scrollHeight : window.innerHeight 를 통해 가져온 브라우저 높이 * heightNum (브라우저 높이 x 5)
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
    }


    function calcValues(values, currentYoffset) {
        let rv;

        const scrollHeight = sceneInfo[currentScene].scrollHeight;

        // 현재 Scene 에서 스크롤 된 범위를 비율로 구하기
        // Scene 에서의 스크롤 위치 / Scene 전체의 높이 
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
            rv = scrollRatio * (values[1] - values[0]) + values[0]
        }


        return rv;
    }

    function playAnimation() {
        const objs = sceneInfo[currentScene].objs;              // currentScene === sceneIndex 
        const values = sceneInfo[currentScene].values;
        const currentYoffset = yOffset - prevScrollHeight       // scene 에서의 스크롤 위치 


        switch (currentScene) {
            case 0:
                let messageA_opacity_in = calcValues(values.messageA_opacity_in, currentYoffset);
                objs.messageA.style.opacity = messageA_opacity_in;
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
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
        if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            enterNewScene = true
            currentScene++;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }

        // 이전 스크롤 높이보다 현재 스크롤 높이가 작으면 Scene Index - 1
        if (yOffset < prevScrollHeight) {
            enterNewScene = true
            if (currentScene === 0) return 0;                                               // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일 및 여러 브라우저 대응)
            currentScene--;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }


        if (enterNewScene) return;
        playAnimation();
    }



    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset                                                        // 현재 스크롤 한 위치를 알 수 있다.
        scrollLoop();
    })

    window.addEventListener('resize', setLayout)                                            // resize 이벤트가 발생하면 높이를 유연하게 변경하기 위한 메소드.
    window.addEventListener('load', setLayout)                                              // 이미지 리소스 까지 다 받은 후 작동

    setLayout();
})();
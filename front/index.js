let scale = 1
let logoOriginWidth = 0
let logoOriginHeight = 0
let backgroundOriginWidth = 0
let backgroundOriginHeight = 0
let logoX = 0
let logoY = 0
let logoFile = undefined
let backgroundFile = undefined

function init() {
    let container = document.createElement('img');
    let wrapper = document.getElementById('wrapper')
    container.classList.add('container');
    container.id = 'background'
    container.draggable = false
    container.style.margin = "0"

    let logo = document.createElement("img")
    logo.id = "logo"
    logo.style.position = 'absolute';
    logo.style.top = "0"
    logo.style.left = "0"
    logo.style.opacity = "0.5"
    logo.style.margin = "0"

    wrapper.appendChild(container);
    wrapper.appendChild(logo);
}
init()
doStuff()
function doStuff() {
    let logo = document.getElementById("logo");
    let background = document.getElementById("background");
    logo.onmousedown = function (event) {
        logo.classList.add('bordered')
        background.classList.add('bordered')

        let shiftX = event.clientX - logo.getBoundingClientRect().left;
        let shiftY = event.clientY - logo.getBoundingClientRect().top;

        logo.style.position = 'absolute';
        logo.style.zIndex = 1000;
        document.body.append(logo);
        function moveAt(pageX, pageY) {
            logo.style.left = pageX - shiftX + 'px';
            logo.style.top = pageY - shiftY + 'px';

            if (logo.getBoundingClientRect().right > background.getBoundingClientRect().right) {
                logo.style.left = background.offsetLeft + background.width - logo.getBoundingClientRect().width + 'px';
            }
            if (logo.getBoundingClientRect().left < background.getBoundingClientRect().left) {
                logo.style.left = background.offsetLeft + 'px';
            }
            if (logo.offsetTop + logo.offsetHeight > background.offsetTop + background.offsetHeight) {
                logo.style.top = background.offsetTop + background.height - logo.height + 'px';
            }
            if (logo.offsetTop < background.offsetTop) {
                logo.style.top = background.offsetTop + 'px';
            }
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', onMouseMove);
            logo.classList.remove("bordered")
            background.classList.remove("bordered")
            logo.onmouseup = null;
        });
    }
    logo.ontouchstart = function (event) {

        logo.classList.add('bordered')
        background.classList.add('bordered')

        let shiftX = event.targetTouches[0].pageX - logo.getBoundingClientRect().left;
        let shiftY = event.targetTouches[0].pageY - logo.getBoundingClientRect().top;
        logo.style.position = 'absolute';
        logo.style.zIndex = 1000;
        document.body.append(logo);

        function moveAt(pageX, pageY) {
            logo.style.left = pageX - shiftX + 'px';
            logo.style.top = pageY - shiftY + 'px';
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
        }
        document.addEventListener('touchmove', onMouseMove);
        logo.onmouseup = function () {
            document.removeEventListener('touchmove', onMouseMove);
            logo.classList.remove("bordered")
            background.classList.remove("bordered")
            logo.onmouseup = null;
        };
    }
    logo.ondragstart = function () {
        return false;
    };
}


let loadBackground = function (event) {
    backgroundOriginWidth = 0
    backgroundOriginHeight = 0
    scale = 1
    const windowheight = window.screen.availHeight - 100
    const windowwidth = window.screen.availWidth - 100
    console.log(windowheight, windowwidth)
    var output = document.getElementById('background');
    backgroundFile = event.target.files[0];
    output.src = URL.createObjectURL(event.target.files[0]);

    output.onload = function () {
        if (this.height > windowheight) {
            scale = windowheight / this.height
            this.height = windowheight
        }

        if (this.width > windowwidth) {
            scale = windowwidth / this.width
            this.width = windowwidth
            this.height = this.height * scale
        }
        const tmp1 = this.width;
        backgroundOriginHeight = tmp1;
        const tmp2 = this.height;
        backgroundOriginWidth = tmp2;

        URL.revokeObjectURL(output.src) // free memory
    }
};

let loadLogo = function (event) {
    logoOriginWidth = 0
    logoOriginHeight = 0

    let logo = document.getElementById('logo');
    let background = document.getElementById('background');
    logoFile = event.target.files[0];
    scale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth)
    logo.src = URL.createObjectURL(event.target.files[0]);
    logo.onload = function () {
        URL.revokeObjectURL(logo.src) // free memory
        const logoWidth = this.width * scale;
        const logoHeight = this.height * scale;
        logo.style.top = background.offsetTop + 'px'
        logo.style.left = background.offsetLeft + 'px'
        logo.width = logoWidth;
        logo.height = logoHeight;
        logoOriginWidth = logoWidth;
        logoOriginHeight = logoHeight;

        let logoscale = document.getElementById('logoscale');
        logoscale.value = "100";
    }
};


let onButtonClick = function (event) {
    let logo = document.getElementById('logo');
    let background = document.getElementById('background');
    const logoTmp = logo.getBoundingClientRect();
    const backgroundTmp = background.getBoundingClientRect();
    if (logoTmp.top < backgroundTmp.top || logoTmp.left < backgroundTmp.left || logoTmp.right > backgroundTmp.right || logoTmp.bottom > backgroundTmp.bottom) {
        alert("The logo is not in the background")
        return
    }
    let body = document.getElementById("body")
    document.getElementById("wrapper").classList.add("blurred")
    let loading = document.createElement('div')
    loading.classList.add('loading-wrapper')
    loading.innerHTML = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
    body.appendChild(loading)
    let formData = new FormData();
    let logoscale = document.getElementById('logoscale');
    logoY = (logoTmp.top - backgroundTmp.top) / scale
    logoX = (logoTmp.left - backgroundTmp.left) / scale
    formData.append('logox', Math.trunc(logoX));
    formData.append('logoy', Math.trunc(logoY));
    formData.append('scale', logoscale.value);
    formData.append('image', backgroundFile);
    formData.append('logo', logoFile);
    fetch("/watermark", {
        method: 'post',
        body: formData
    }).then(res => res.blob()).then(blob => {
        let m = new Date();
        let dateString = m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) + "/" + m.getUTCDate() + "_" + m.getUTCHours() + "_" + m.getUTCMinutes() + "_" + m.getUTCSeconds();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        if (backgroundFile.type == "image/png") {
            a.download = "image_" + dateString + ".png";
        } else {
            a.download = "image_" + dateString + ".jpeg";
        }
        a.click();
        document.getElementById("wrapper").classList.remove("blurred")
        loading.remove()
    }).catch(err => alert(err))

}

let onReset = function (event) {
    logoFile = undefined
    backgroundFile = undefined

    scale = 1
    logoOriginHeight = 0
    logoOriginWidth = 0
    backgroundOriginHeight = 0
    backgroundOriginWidth = 0
    let logo = document.getElementById('logo');
    let background = document.getElementById('background');
    let logoscale = document.getElementById('logoscale');
    logoscale.value = "100"
    logo.remove()
    background.remove()

    init()
    doStuff()
}

let onChangeLogoScale = function (event) {
    let re = /^[0-9]+$/;
    if (!re.test(event.target.value)) {
        event.target.value = "100"
        alert("Please enter a number");
    }
    if (event.target.value > 400 || event.target.value < 1) {
        event.target.value = "100"
        alert("Please enter a number between 1 and 100");
    }
    let logo = document.getElementById('logo');
    const width = logoOriginWidth * parseInt(event.target.value, 10) / 100;
    const height = logoOriginHeight * parseInt(event.target.value, 10) / 100;
    logo.width = width
    logo.height = height
}


let resetLogoScale = function () {
    let logoscale = document.getElementById('logoscale');
    logoscale.value = "100"
}

let onSubmit = function (event) {
    let logo = document.getElementById('logo');
    let background = document.getElementById('background');
    const logoTmp = logo.getBoundingClientRect();
    const backgroundTmp = background.getBoundingClientRect();
    if (logoTmp.top < backgroundTmp.top || logoTmp.left < backgroundTmp.left || logoTmp.right > backgroundTmp.right || logoTmp.bottom > backgroundTmp.bottom) {
        event.preventDefault()
        alert("The logo is not in the background")
        return
    }

    let posx = document.getElementById("posx")
    let posy = document.getElementById("posy")

    logoY = (logoTmp.top - backgroundTmp.top) / scale
    logoX = (logoTmp.left - backgroundTmp.left) / scale
    posx.value = Math.trunc(logoX)
    posy.value = Math.trunc(logoY)
}

let downloadBlob = function (content, filename) {
    console.log(content)
    const blob = new Blob([content]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}
let scale = 1
let logoOriginWidth = 0
let logoOriginHeight = 0
let backgroundOriginWidth = 0
let backgroundOriginHeight = 0
let logoX = 0
let logoY = 0
let logoFile = undefined
let backgroundFile = undefined
window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function init() {
    let container = document.createElement('img');
    let wrapper = document.getElementById('wrapper')
    container.classList.add('container');
    container.id = 'background'
    container.draggable = false
    container.style.margin = "0"

    let logo = document.createElement("img")
    logo.id = "logo"
    logo.style.position = 'fixed';
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
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
        document.addEventListener('mousemove', onMouseMove);
        logo.onmouseup = function () {
            document.removeEventListener('mousemove', onMouseMove);
            logo.classList.remove("bordered")
            background.classList.remove("bordered")
            logo.onmouseup = null;
        };
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
    console.log(background.width, background.height, background.naturalHeight, background.naturalWidth)
    logoFile = event.target.files[0];
    scale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth)
    logo.src = URL.createObjectURL(event.target.files[0]);
    logo.onload = function () {
        URL.revokeObjectURL(logo.src) // free memory
        const logoWidth = this.width * scale;
        const logoHeight = this.height * scale;
        console.log(this.width, this.height, logoWidth, logoHeight, scale)
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
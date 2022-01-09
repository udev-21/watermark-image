let scale = 1
let logoOriginWidth = 0
let logoOriginHeight = 0
let backgroundOriginWidth = 0
let backgroundOriginHeight = 0
let logoX = 0
let logoY = 0
let logoFile = undefined
let backgroundFiles = []

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

function createNewItem(id) {
    let wrapper = document.createElement('div')
    wrapper.classList.add("wrapper")
    let background = new Image()
    background.draggable = false

    let logo = new Image()
    logo.style.opacity = "0.5"
    logo.style.position = "absolute"
    logo.draggable = false
    logo.id = "logo" + id

    let logoscaleLabel = document.createElement('label')
    let logoscale = document.createElement('input')
    logoscaleLabel.innerText = "LogoScale "
    logoscaleLabel.appendChild(logoscale)
    wrapper.appendChild(background)
    wrapper.appendChild(logo)
    wrapper.appendChild(document.createElement("br"))
    wrapper.appendChild(logoscaleLabel)
    return wrapper
}

let loadBackground = function (event) {
    let outerWrapper = document.getElementById('wrappers');

    const windowwidth = window.screen.availWidth
    const windowheight = window.screen.availHeight
    let backgroundWidth = windowwidth
    let gridTemplateColumns = ""

    if (windowwidth <= 768) {
        gridTemplateColumns = "auto"
    } else if (windowwidth <= 1200) {
        gridTemplateColumns = "auto auto"
        backgroundWidth = (windowwidth / 2)
    } else {
        gridTemplateColumns = "auto auto auto"
        backgroundWidth = (windowwidth / 3)
    }
    backgroundWidth -= 50;
    outerWrapper.style.gridTemplateColumns = gridTemplateColumns

    let wrappers = []
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        let file = files.item(i)
        backgroundFiles[i] = file
        let item = createNewItem(i)
        let backgroundContainer = item.firstChild
        backgroundContainer.src = URL.createObjectURL(file)
        backgroundContainer.style.width = backgroundWidth + "px"
        backgroundContainer.onload = function () {
            if (this.height > windowheight) {
                this.height = windowheight - 150
                this.style.width = ""
            }
            URL.revokeObjectURL(backgroundContainer.src)
        }
        outerWrapper.appendChild(item)
    }
    return
};

let loadLogo = function (event) {
    logoFile = event.target.files[0];

    let wrappers = document.getElementsByClassName("wrapper")

    for (let i = 0; i < wrappers.length; i++) {
        const element = wrappers[i];
        let background = element.firstChild;
        let logo = background.nextSibling;
        logo.src = URL.createObjectURL(logoFile)
        let backgroundScale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth)
        let logoscale = logo.nextSibling.nextSibling.firstChild.nextSibling;

        logo.onload = function () {
            URL.revokeObjectURL(logo.src)
            if (this.naturalHeight > background.naturalHeight || this.naturalWidth > background.naturalWidth) {
                const widthFlow = this.naturalWidth - background.naturalWidth;
                const heightFlow = this.naturalHeight - background.naturalHeight;
                if (widthFlow > heightFlow) {
                    const scale = background.naturalWidth / this.naturalWidth;
                    const logoWidth = Math.trunc(this.width * backgroundScale * scale);
                    const logoHeight = Math.trunc(this.height * backgroundScale * scale);
                    logo.width = logoWidth;
                    logo.height = logoHeight;
                    logoscale.value = Math.trunc(scale * 100);
                } else {
                    const scale = background.naturalHeight / this.naturalHeight;
                    const logoWidth = this.width * backgroundScale * scale;
                    const logoHeight = this.height * backgroundScale * scale;
                    logo.width = logoWidth;
                    logo.height = logoHeight;
                    logoscale.value = Math.trunc(scale * 100);
                }
            } else {
                const logoWidth = this.width * backgroundScale;
                const logoHeight = this.height * backgroundScale;
                logo.width = logoWidth;
                logo.height = logoHeight;
                logoscale.value = "100";
            }
            logo.style.top = background.offsetTop + 'px';
            logo.style.left = background.offsetLeft + 'px';
        }
        logo.onmousedown = function (event) {
            logo.classList.add('bordered')

            let shiftX = event.clientX - logo.getBoundingClientRect().left;
            let shiftY = event.clientY - logo.getBoundingClientRect().top;

            logo.style.zIndex = 1000;
            logo.style.position = 'absolute';
            document.body.append(logo);

            function moveAt(pageX, pageY) {
                logo.style.left = pageX - shiftX + 'px';
                logo.style.top = pageY - shiftY + 'px';
                if (logo.getBoundingClientRect().right > background.getBoundingClientRect().right) {
                    logo.style.left = background.getBoundingClientRect().right - logo.getBoundingClientRect().width + 'px';
                }
                if (logo.getBoundingClientRect().left < background.getBoundingClientRect().left) {
                    logo.style.left = background.getBoundingClientRect().left + 'px';
                }
                if (logo.offsetTop + logo.offsetHeight > background.offsetTop + background.offsetHeight) {
                    logo.style.top = background.offsetHeight - logo.getBoundingClientRect().height + background.offsetTop + 'px';
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
                logo.onmouseup = null;
                console.log(logo.getBoundingClientRect(), background.getBoundingClientRect())
            });
        }

        logoscale.onfocus = function () {
            this.oldvalue = this.value;
        }

        logoscale.onchange = function (event) {
            let re = /^[0-9]+$/;
            if (!re.test(event.target.value)) {
                this.value = this.oldvalue
                return
            }
            if (this.value * logo.naturalWidth / 100 > background.naturalWidth || this.value * logo.naturalHeight / 100 > background.naturalHeight) {
                alert("invalid value, max value is: " + Math.trunc(Math.min((background.naturalWidth * 100) / logo.naturalWidth, (background.naturalHeight * 100) / logo.naturalHeight)))
                this.value = this.oldvalue
            } else {
                logo.width = Math.trunc(logo.naturalWidth * backgroundScale * this.value / 100)
                logo.height = Math.trunc(logo.naturalHeight * backgroundScale * this.value / 100)
            }
            this.oldvalue = this.value;
        }
    }
    return
};


let onButtonClick = function (event) {
    let body = document.getElementById("body")
    document.getElementById("wrappers").classList.add("blurred")
    let loading = document.createElement('div')
    loading.classList.add('loading-wrapper')
    loading.innerHTML = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
    body.appendChild(loading)

    let wrappers = document.getElementsByClassName("wrapper")
    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];
        const background = wrapper.firstChild;
        const backgroundScale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth)
        let logoscale = undefined
        let logo = undefined
        if (background.nextSibling.nodeName == "BR") {
            logo = document.getElementById("logo" + i)
            logoscale = background.nextSibling.nextSibling.lastChild;
        } else {
            logo = background.nextSibling;
            logoscale = logo.nextSibling.nextSibling.lastChild;
        }
        console.log(logo)

        const logoTmp = logo.getBoundingClientRect();
        const backgroundTmp = background.getBoundingClientRect();

        let formData = new FormData();
        logoY = (logoTmp.top - backgroundTmp.top) / backgroundScale
        logoX = (logoTmp.left - backgroundTmp.left) / backgroundScale

        formData.append('logox', Math.trunc(logoX));
        formData.append('logoy', Math.trunc(logoY));
        formData.append('scale', logoscale.value);
        formData.append('image', backgroundFiles[i]);
        formData.append('logo', logoFile);
        fetch("/watermark", {
            method: 'post',
            body: formData
        }).then(res => res.blob()).then(blob => {
            let m = new Date();
            let dateString = m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) + "/" + m.getUTCDate() + "_" + m.getUTCHours() + "_" + m.getUTCMinutes() + "_" + m.getUTCSeconds();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            if (backgroundFiles[i].type == "image/png") {
                a.download = "image_" + dateString + ".png";
            } else {
                a.download = "image_" + dateString + ".jpeg";
            }
            a.click();
            document.getElementById("wrappers").classList.remove("blurred")
            loading.remove()
        }).catch(err => alert(err))
        return
    }


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
    alert('something')
}


let resetLogoScale = function () {
    let logoscale = document.getElementById('logoscale');
    logoscale.value = "100"
}

let logoFile = undefined;
let backgroundFiles = [];

const cat = localStorage.getItem('api_key');
console.log(cat)
if (cat == "" || cat == null) {
    let login = document.getElementById("login");
    login.classList.remove("displaynone");
}

function createNewItem(id) {
    let wrapper = document.createElement('div');
    wrapper.classList.add("wrapper");
    let background = new Image();
    background.draggable = false;
    background.id = "background" + id;
    background.setAttribute("data-id", id);

    let logo = new Image();
    logo.style.opacity = "0.5";
    logo.classList.add("logo");
    logo.style.position = "absolute";
    logo.draggable = false;
    logo.id = "logo" + id;
    logo.setAttribute("data-id", id);

    let logoscaleLabel = document.createElement('label');
    let logoscale = document.createElement('input');
    logoscaleLabel.innerText = "LogoScale ";
    logoscaleLabel.appendChild(logoscale);
    wrapper.appendChild(background);
    wrapper.appendChild(logo);
    wrapper.appendChild(document.createElement("br"));
    wrapper.appendChild(logoscaleLabel);

    return wrapper;
}

let loadBackground = function (event) {
    let outerWrapper = document.getElementById('wrappers');
    document.getElementById("opacity").value = "128";

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
    setTimeout(loadLogo, 100);
    return
};

let loadLogo = function (event) {
    // logoFile = event.target.files[0];
    logoUrl = "/logo.png";

    let wrappers = document.getElementsByClassName("wrapper");

    for (let i = 0; i < wrappers.length; i++) {
        const element = wrappers[i];
        let background = document.getElementById("background" + i);
        let logo = background.nextSibling;
        logo.src = logoUrl;
        let backgroundScale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth);
        let logoscale = logo.nextSibling.nextSibling.firstChild.nextSibling;
        console.log(background);
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
                logo.onmouseup = null;
            });
        }

        logoscale.onfocus = function () {
            this.oldvalue = this.value;
        }

        logoscale.onchange = function (event) {
            let re = /^[0-9]+$/;
            if (!re.test(event.target.value)) {
                this.value = this.oldvalue;
                return;
            }
            if (this.value * logo.naturalWidth / 100 > background.naturalWidth || this.value * logo.naturalHeight / 100 > background.naturalHeight) {
                alert("invalid value, max value is: " + Math.trunc(Math.min((background.naturalWidth * 100) / logo.naturalWidth, (background.naturalHeight * 100) / logo.naturalHeight)));
                this.value = this.oldvalue;
            } else {
                logo.width = Math.trunc(logo.naturalWidth * backgroundScale * this.value / 100);
                logo.height = Math.trunc(logo.naturalHeight * backgroundScale * this.value / 100);
            }
            this.oldvalue = this.value;

        }
    }
    return
};


let onButtonClick = function (event) {
    let formData = new FormData();

    let wrappers = document.getElementsByClassName("wrapper");
    let opacity = document.getElementById("opacity").value;

    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];
        const background = wrapper.firstChild;
        const backgroundScale = Math.min(background.height / background.naturalHeight, background.width / background.naturalWidth);
        let logoscale = undefined;
        let logo = undefined;
        if (background.nextSibling.nodeName == "BR") {
            logo = document.getElementById("logo" + i);
            logoscale = background.nextSibling.nextSibling.lastChild;
        } else {
            logo = background.nextSibling;
            logoscale = logo.nextSibling.nextSibling.lastChild;
        }

        const logoTmp = logo.getBoundingClientRect();
        const backgroundTmp = background.getBoundingClientRect();

        logoY = (logoTmp.top - backgroundTmp.top) / backgroundScale;
        logoX = (logoTmp.left - backgroundTmp.left) / backgroundScale;

        formData.append('logox', Math.trunc(logoX));
        formData.append('logoy', Math.trunc(logoY));
        formData.append('scale', logoscale.value);
        formData.append('image', backgroundFiles[i]);
        formData.append('opacity', opacity);
        // wrapper.classList.add("blurred");
    }

    // const logos = document.getElementsByClassName("logo");
    // for (let i = 0; i < logos.length; i++) {
    //     const logo = logos[i];
    //     logo.classList.add("blurred");
    // }

    let body = document.getElementById("body");
    let loading = document.createElement('div');
    loading.classList.add('loading-wrapper');
    loading.innerHTML = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
    body.appendChild(loading);

    // formData.append('logo', logoFile);
    fetch("/watermark-zip", {
        method: 'post',
        body: formData,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('api_key')
        }
    }).then(res => {
        if (res.ok) {
            return res.blob().then(blob => {
                let m = new Date();
                let dateString = m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) + "/" + m.getUTCDate() + "_" + m.getUTCHours() + "_" + m.getUTCMinutes() + "_" + m.getUTCSeconds();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = dateString + ".zip";
                a.click();

                // for (let i = 0; i < logos.length; i++) {
                //     const logo = logos[i];
                //     logo.classList.remove("blurred");
                //     const wrapper = wrappers[i];
                //     wrapper.classList.remove("blurred");
                // }
                loading.remove();
            });
        } else {
            alert("Error: " + res.body);
            for (let i = 0; i < logos.length; i++) {
                const logo = logos[i];
                logo.classList.remove("blurred");
                const wrapper = wrappers[i];
                wrapper.classList.remove("blurred");
            }
            loading.remove();
        }
    });
}

let onReset = function (event) {
    logoFile = undefined;
    backgroundFiles = [];
    removeElementsByClass("wrapper");
    removeElementsByClass("logo");
}
function removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function onLogin(event) {
    let nickname = document.getElementById("nickname").value;
    let password = document.getElementById("password").value;
    let formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('password', password);
    let login = document.getElementById("login");
    fetch("/api/auth", {
        method: 'post',
        body: formData
    }).then(res => {
        if (res.ok) {
            login.classList.add("displaynone");
            localStorage.setItem("api_key", password);
        } else {
            alert("wrong nickname or password");
        }
    })
}

function onInputRangeSlider() {
    let logos = document.getElementsByClassName("logo");
    const opacity = document.getElementById("opacity").value;
    for (let i = 0; i < logos.length; i++) {
        const logo = logos[i];
        logo.style.opacity = opacity / 256;
    }
}

function onChangeLogoPositionStr() {
    let logos = document.getElementsByClassName("logo");
    const positionStr = document.getElementById("logoPositionStr").value;
    for (let i = 0; i < logos.length; i++) {
        const logo = logos[i];

        let background = document.getElementById("background" + logo.getAttribute("data-id"));


        // if (logo.getBoundingClientRect().right > background.getBoundingClientRect().right) {
        //     logo.style.left = background.getBoundingClientRect().right - logo.getBoundingClientRect().width + 'px';
        // }
        // if (logo.getBoundingClientRect().left < background.getBoundingClientRect().left) {
        //     logo.style.left = background.getBoundingClientRect().left + 'px';
        // }
        // if (logo.offsetTop + logo.offsetHeight > background.offsetTop + background.offsetHeight) {
        //     logo.style.top = background.offsetHeight - logo.getBoundingClientRect().height + background.offsetTop + 'px';
        // }
        // if (logo.offsetTop < background.offsetTop) {
        //     logo.style.top = background.offsetTop + 'px';
        // }

        if (positionStr == "TopLeft") {
            logo.style.top = background.offsetTop + 'px';
            logo.style.left = background.getBoundingClientRect().left + 'px';
        } else if (positionStr == "TopRight") {
            logo.style.top = background.offsetTop + 'px';
            logo.style.left = background.getBoundingClientRect().right - logo.getBoundingClientRect().width + 'px';
        } else if (positionStr == "BottomLeft") {
            logo.style.top = background.offsetHeight - logo.getBoundingClientRect().height + background.offsetTop + 'px';
            logo.style.left = background.offsetLeft + 'px';
        } else if (positionStr == "BottomRight") {
            logo.style.top = background.offsetHeight - logo.getBoundingClientRect().height + background.offsetTop + 'px';
            logo.style.left = background.getBoundingClientRect().right - logo.getBoundingClientRect().width + 'px';
        }
    }
}
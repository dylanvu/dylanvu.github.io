var frameInterval = 12
var endMargin = "15px"

function fadeIn() {
    var opacity = 0;
    var textElem = document.getElementById("fade");
    var id = setInterval(frame, frameInterval);
    function frame() {
        if (opacity >= 1) {
            clearInterval(id);
            //textElem.removeAttribute("id")
            //console.log("Animation done!");
        } else {
            opacity = opacity + 0.04;
            var opacityStyle = opacity.toString();
            textElem.style.opacity = opacityStyle;
        }
    }
}

function FlyInLeft1() {
    var marginPercent = 100;
    var textElem = document.getElementById("fly-in-left1");
    var id = setInterval(frame, frameInterval);
    function frame() {
        if (marginPercent <= 0) {
            clearInterval(id);
            textElem.style.margin = endMargin;
            textElem.removeAttribute("id")
            console.log("FlyInLeft Animation done!");
        } else {
            marginPercent = marginPercent - 5;
            var marginStyle = marginPercent.toString() +"%";
            textElem.style.marginRight = marginStyle;
        }
    }
}

function FlyInRight1() {
    var marginPercent = 100;
    var textElem = document.getElementById("fly-in-right1");
    var id = setInterval(frame, frameInterval);
    function frame() {
        if (marginPercent <= 0) {
            clearInterval(id);
            textElem.style.margin = endMargin;
            textElem.removeAttribute("id")
            console.log("FlyInRight Animation done!");
        } else {
            marginPercent = marginPercent - 5;
            var marginStyle = marginPercent.toString() +"%";
            textElem.style.marginLeft = marginStyle;
        }
    }
}

function FlyInLeft2() {
    var marginPercent = 100;
    var textElem = document.getElementById("fly-in-left2");
    var id = setInterval(frame, frameInterval);
    function frame() {
        if (marginPercent <= 0) {
            clearInterval(id);
            textElem.style.margin = endMargin;
            textElem.removeAttribute("id")
            console.log("FlyInLeft Animation done!");
        } else {
            marginPercent = marginPercent - 5;
            var marginStyle = marginPercent.toString() +"%";
            textElem.style.marginRight = marginStyle;
        }
    }
}

function FlyInRight2() {
    var marginPercent = 100;
    var textElem = document.getElementById("fly-in-right2");
    var id = setInterval(frame, frameInterval);
    function frame() {
        if (marginPercent <= 0) {
            clearInterval(id);
            textElem.style.margin = endMargin;
            textElem.removeAttribute("id")
            console.log("FlyInRight Animation done!");
        } else {
            marginPercent = marginPercent - 5;
            var marginStyle = marginPercent.toString() +"%";
            textElem.style.marginLeft = marginStyle;
        }
    }
}

export {fadeIn, FlyInLeft1, FlyInLeft2, FlyInRight1, FlyInRight2};

// function FlyInLeft1() {
//     var marginPercent = 100;
//     //var marginX = 400;
//     var textElem = document.getElementById("fly-in-left1");
//     var id = setInterval(frame, 5);
//     function frame() {
//         if (marginPercent <= 0) {
//             clearInterval(id);
//             textElem.removeAttribute("id")
//             console.log("FlyInLeft Animation done!");
//         } else {
//           //marginPercent = 100-5*(-marginX+400)^0.5;
//             marginPercent = marginPercent - 2;
//           //marginX = marginX-8;
//             console.log(marginPercent);
//             var marginStyle = marginPercent.toString() +"%";
//             textElem.style.marginRight = marginStyle;
//         }/*  */
//     }
// }
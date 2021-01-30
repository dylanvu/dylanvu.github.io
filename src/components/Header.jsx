import React from 'react'

function Header() {
    return(
        <div>
            <header id="fade">Dylan Vu</header>
            <script>
                {setTimeout(fadeIn, 550)}
            </script>
        </div>
    )
}

export default Header

function fadeIn() {
    var opacity = 0;
    var textElem = document.getElementById("fade");
    var id = setInterval(frame, 5);
    function frame() {
        if (opacity >= 1) {
            clearInterval(id);
            textElem.removeAttribute("id")
            //console.log("Animation done!");
        } else {
            opacity = opacity + 0.04;
            var opacityStyle = opacity.toString();
            textElem.style.opacity = opacityStyle;
        }
    }
}
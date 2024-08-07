function setLogo() {
    $(".my-logo").replaceWith(
        `<span class="fa-stack fa-2xl">
            <i class="fa-brands fa-searchengin fa-stack-1x fa-beat-fade" style="--fa-animation-duration: 2s; --fa-beat-fade-opacity: 0.5; --fa-beat-fade-scale: 1.1;"></i>
            <i class="fa-regular fa-file fa-stack-2x"></i>
            <span class="fa-layers fa-2x">
                <span class="logo-word pos-up">Docu</span>
                <span class="logo-word pos-down">Matcher</span>
            </span>
        </span>`
    );
}

function CloseAlertDiv(divId) {
    if (!divId) {
        divId = "#AlertModalDiv";
    }

    window.$(divId).addClass("d-none");
}

$(() => {
    setLogo();
});

let currentFontSize = 16; // Default font size
let longPressInterval;

function adjustCardHeight() {
    const height = document.getElementById('cardHeightInput').value;
    const cardBodies = document.querySelectorAll('.card-body');
    cardBodies.forEach(cardBody => {
        cardBody.style.height = height > 0 ? height + 'px' : 'auto';
    });
}

function rsidHideAll(btn) {
    const $btn = $(btn);
    const $icon = $btn.find('i');
    if ($icon.hasClass('fa-eye-slash')){
        $icon.removeClass('fa-eye-slash').addClass('fa-eye')
        $btn.html($btn.html().replace('Hide All','Unhide All'))
        document.querySelectorAll('.card-body p').forEach(p => p.style.display = 'none');
    } else{
        $icon.removeClass('fa-eye').addClass('fa-eye-slash')
        $btn.html($btn.html().replace('Unhide All','Hide All'))
        document.querySelectorAll('.card-body p').forEach(p => p.style.display = 'block');
    }
}

function switchVisualiseDocx(){
    const $visualiseDocxs = $('#visualise-result-container > .row > div')
    const firstDocx = $visualiseDocxs[0]
    const secondDocx = $visualiseDocxs[1]
    $(firstDocx).insertAfter($(secondDocx));
}

function adjustFontSize() {
    $('.card-body p').css('font-size', currentFontSize + 'px');
}

function decreaseFontSize() {
    currentFontSize = Math.max(10, currentFontSize - 1); // min 10px
    adjustFontSize();
}

function resetFontSize() {
    currentFontSize = 16;
    adjustFontSize();
}

function increaseFontSize() {
    currentFontSize = Math.min(35, currentFontSize + 1); // max 35px
    adjustFontSize();
}

function handleLongPress(action) {
    longPressInterval = setInterval(action, 100); // Adjusts every 100ms while pressed
}

function clearLongPress() {
    clearInterval(longPressInterval);
}

function toggleElementsVisibility(isVisible) {
    const $navBar = $("nav");
    const $settingBar = $("#setting-bar-container");
    const $visualiseResult = $("#visualise-result-container");

    const action = isVisible ? 'show' : 'hide';
    const containerClass = isVisible ? "container" : "container-fluid";
    
    $navBar[action]();
    $settingBar[action]();
    $visualiseResult.attr("class", containerClass);
    $visualiseResult.find(".card-body")
        .toggleClass('pdf', !isVisible)
}

function exportPDF() {
    toggleElementsVisibility(false);
    window.print();
    toggleElementsVisibility(true);
}

function exportSinglePDF() {
    exportPDF();
}

$(document).ready(function() {
    $('#decrease-btn').on('mousedown', function() {
        handleLongPress(decreaseFontSize);
    }).on('mouseup mouseleave', clearLongPress);

    $('#increase-btn').on('mousedown', function() {
        handleLongPress(increaseFontSize);
    }).on('mouseup mouseleave', clearLongPress);
});
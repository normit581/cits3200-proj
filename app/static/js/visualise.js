
let currentFontSize = 16; // Default font size
let longPressInterval;
let settingsBar = document.getElementById("settingsBar");
let sticky = settingsBar.offsetTop;

function fixSettingsBar() {
    $row = $(settingsBar).parent();
    if (window.scrollY > sticky) {
        $row.addClass("sticky-settings-bar");
    } else {
        $row.removeClass("sticky-settings-bar");
    }
}

function adjustCardHeight() {
    const height = document.getElementById('cardHeightInput').value;
    const cardBodies = document.querySelectorAll('.card-body');
    cardBodies.forEach(cardBody => {
        cardBody.style.height = height ? height + 'px' : 'auto';
    });
}

function rsid_hide_all() {
    document.querySelectorAll('.card-body p').forEach(p => p.style.display = 'none');
}

function rsid_unhide_all() {
    document.querySelectorAll('.card-body p').forEach(p => p.style.display = 'block');
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

$(document).ready(function() {
    window.onscroll = function() {fixSettingsBar()};

    $('#decrease-btn').on('mousedown', function() {
        handleLongPress(decreaseFontSize);
    }).on('mouseup mouseleave', clearLongPress);

    $('#increase-btn').on('mousedown', function() {
        handleLongPress(increaseFontSize);
    }).on('mouseup mouseleave', clearLongPress);

    let myCollapsible = document.getElementById('settingsBar')
    let $settingsDiv = $('#settingsBarCollapseBtn').parent();
    let $settingsRow = $settingsDiv.parent();
    myCollapsible.addEventListener('hidden.bs.collapse', function () {
        $settingsDiv.removeClass('col-1');
        $settingsRow.removeClass("settings-bg-color");
    })
    myCollapsible.addEventListener('show.bs.collapse', function () {
        $settingsDiv.addClass('col-1');
        $settingsRow.addClass("settings-bg-color");
    })
});
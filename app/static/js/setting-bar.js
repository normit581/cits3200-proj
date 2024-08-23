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

$(document).ready(function() {
    window.onscroll = function() {fixSettingsBar()};

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
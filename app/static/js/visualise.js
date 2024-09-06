const defaultFontSize = 16; // Default font size
let currentFontSize = defaultFontSize;
let longPressInterval;
const contextMenuID = 'custom-context-menu';

function adjustCardHeight() {
    const height = document.getElementById('cardHeightInput').value;
    const cardBodies = document.querySelectorAll('.card-body');
    cardBodies.forEach(cardBody => {
        cardBody.style.height = height > 0 ? height + 'px' : 'auto';
    });
}

function rsidColourToggleVisibility(btn, target, isAll = false, hideText = 'Hide', showText = 'Unhide') {
    const $btn = $(btn);
    const $icon = $btn.find('i');

    const isHidden = $icon.hasClass('fa-eye-slash');
    const action = isHidden ? 'addClass' : 'removeClass';
    const reverse = isHidden ? 'removeClass' : 'addClass';
    
    $icon[action]('fa-eye')[reverse]('fa-eye-slash');
    $btn.html($btn.html().replace(isHidden ? showText : hideText, isHidden ? hideText : showText));

    $(target)[action]('hidden-colour');

    if (isAll)
        $btn.siblings('button.rsidButton').each(function() {
            $(this).find('i')[action]('fa-eye')[reverse]('fa-eye-slash');
            $(this).html($(this).html().replace(isHidden ? showText : hideText, isHidden ? hideText : showText));
        });{
    }
}

function switchVisualiseDocx(){
    const $visualiseDocxs = $('#visualise-result-container > .row > div')
    const firstDocx = $visualiseDocxs[0]
    const secondDocx = $visualiseDocxs[1]
    $(firstDocx).insertAfter($(secondDocx));
}

function adjustFontSize(direction) {
    currentFontSize = direction === 0 ? defaultFontSize : Math.max(10, Math.min(35, currentFontSize + direction));
    $('.card-body p').css('font-size', currentFontSize + 'px');
}

function handleLongPress(action) {
    longPressInterval = setInterval(action, 100); // Adjusts every 100ms while pressed
}

function clearLongPress() {
    clearInterval(longPressInterval);
}

function pdfToggleElementsVisibility(isVisible) {
    const $contextMenu = $(`#${contextMenuID}`);
    const action = isVisible ? 'show' : 'hide';
    $contextMenu[action]();
}

function exportPDF() {
    pdfToggleElementsVisibility(false);
    window.print();
    pdfToggleElementsVisibility(true);
}

function exportSinglePDF() {
    exportPDF();
}

function showContextMenu(e){
    const $contextMenu = $(`#${contextMenuID}`);
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const contextMenuHeight = $contextMenu.outerHeight();
    const contextMenuWidth = $contextMenu.outerWidth();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    const availableSpaceBelow = windowHeight - (mouseY - window.scrollY);
    const availableSpaceRight = windowWidth - mouseX;

    let topPosition = mouseY;
    if (availableSpaceBelow < contextMenuHeight) {
        topPosition = mouseY - contextMenuHeight;
    }

    let leftPosition = mouseX;
    if (availableSpaceRight < contextMenuWidth) {
        leftPosition = mouseX - contextMenuWidth;
    }

    $contextMenu
        .css({ top: `${topPosition}px`, left: `${leftPosition}px` })
        .show();
}

function configureContextMenuButtons(){
    $('#pdf-btn').on('click', () => exportSinglePDF() );

    $('#switch-card-btn').on('click', () => switchVisualiseDocx() );

    $('#decrease-btn')
        .on('click', () => adjustFontSize(-1))
        .on('mousedown', () => handleLongPress(() => adjustFontSize(-1)))
        .on('mouseup mouseleave', clearLongPress);

    $('#reset-btn').on('click', () => adjustFontSize(0));

    $('#increase-btn')
        .on('click', () => adjustFontSize(1))
        .on('mousedown', () => handleLongPress(() => adjustFontSize(1)))
        .on('mouseup mouseleave', clearLongPress);

    $('#custom-context-menu .input-group')
        .on('mouseenter', function() { $(this).find('button').addClass('active'); })
        .on('mouseleave', function() { $(this).find('button').removeClass('active'); });


    $('#hide-all-colour-btn').on('click', function() { 
        const $target = $('.card-body p');
        rsidColourToggleVisibility(this, $target, isAll = true);
    });
}

$(document).ready(function() {
    $(`nav, #${contextMenuID}`).hide();

    configureContextMenuButtons();

    $('p[data-colour]').each(function() {
        const colour = $(this).data('colour');
        const cssStyle = colour === 'red' ? 'color' : 'background-color';
        const cssColour = colour === 'red' ? 'red' : `light${colour}`;
        $(this).css(cssStyle, cssColour);
    });

    $(document).on('contextmenu', '.card-body > div', function (e) {
        e.preventDefault();

        const $divContainer = $(this);
        const $btnGroup = $(`#${contextMenuID} .btn-group-vertical`);
        $btnGroup.find('.rsidButton').remove();

        $divContainer.find('p').each(function() {
            const $pTarget = $(this);
            const isVisible = $pTarget.hasClass('hidden-colour');
            const buttonHTML = isVisible 
                ? `<i class="fa-solid fa-eye ps-2"></i> Unhide Colour ${$pTarget.data('colour')}` 
                : `<i class="fa-solid fa-eye-slash ps-2"></i> Hide Colour ${$pTarget.data('colour')}`;
            
            const $button = $('<button>', {
                class: 'btn btn-light text-start rsidButton',
                type: 'button',
                html: buttonHTML
            });

            $button.click(function() {
                rsidColourToggleVisibility(this, $pTarget);
            });
            $btnGroup.append($button);
        });

        showContextMenu(e);
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest(`#${contextMenuID}`).length) {
            $(`#${contextMenuID}`).hide();
        }
    });
});
const defaultFontSize = 16; // Default font size
const defaultTextColour = 'red'; // Default font size
let currentFontSize = defaultFontSize;
let longPressInterval;
const contextMenuID = 'custom-context-menu';
var x;

function adjustCardHeight() {
    const height = document.getElementById('cardHeightInput').value;
    const cardBodies = document.querySelectorAll('.card-body');
    cardBodies.forEach(cardBody => {
        cardBody.style.height = height > 0 ? height + 'px' : 'auto';
    });
}

// Helper function to replace only the text content (ignoring HTML tags)
function toggleButtonText(targetBtn, fromText, toText) {
    targetBtn = targetBtn.hasClass('rsidButton') ? targetBtn.find('.text') : targetBtn;
    x=targetBtn
    $(targetBtn).contents().filter(function() {
        return this.nodeType === 3;  // Node type 3 is a text node
    }).each(function() {
        this.textContent = this.textContent.replace(fromText, toText);
    });
}

function rsidColourToggleVisibility(btn, target, isAll = false, hideText = 'Hide', showText = 'Unhide') {
    const $btn = $(btn);
    const $icon = $btn.find('i');
    
    const isHidden = $icon.hasClass('fa-eye-slash');
    const action = isHidden ? 'addClass' : 'removeClass';
    const reverseAction = isHidden ? 'removeClass' : 'addClass';
    const hideAction = isHidden ? 'hide' : 'show';
    
    $icon[action]('fa-eye')[reverseAction]('fa-eye-slash');

    toggleButtonText($btn, isHidden ? hideText : showText, isHidden ? showText : hideText);

    $(target)[action]('hidden-colour');

    if (isAll) {
        $btn.siblings('button.rsidButton').each(function() {
            const $siblingBtn = $(this);
            const $siblingIcon = $siblingBtn.find('i');
            toggleButtonText($siblingBtn, isHidden ? hideText : showText, isHidden ? showText : hideText);
            $siblingBtn.find('[data-id=color-picker]')[hideAction]();
            $siblingIcon[action]('fa-eye')[reverseAction]('fa-eye-slash');
        });
    }
}

function scrollAdjustPosition(targets, func) {
    const scrollPositions = targets.map(target => $(target).scrollTop());
    func();
    targets.forEach((target, index) => {
        $(target).scrollTop(scrollPositions[index]);
    });
}

function switchVisualiseDocx(){
    const $visualiseDocxs = $('#visualise-result-container > .row > div');
    const firstDocx = $visualiseDocxs[0];
    const secondDocx = $visualiseDocxs[1];
    const targets = [$($visualiseDocxs[0]).find('.card-body'), $($visualiseDocxs[1]).find('.card-body')];
    scrollAdjustPosition(targets, function() {
        $(firstDocx).insertAfter($(secondDocx));
    });
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
    const $visualiseResult = $("#visualise-result-container");

    $visualiseResult.find(".card-body").toggleClass('pdf', !isVisible)
    $contextMenu[action]();
}

function exportPDF() {
    const $visualiseDocxs = $('#visualise-result-container > .row > div .card-body');
    const targets = [$visualiseDocxs[0], $visualiseDocxs[1]];
    scrollAdjustPosition(targets, function() {
        pdfToggleElementsVisibility(false);
        window.print();
        pdfToggleElementsVisibility(true);
    });
}

function exportSinglePDF() {
    exportPDF();
}

$(document).ready(function() {
    $(`nav`).hide();

    configureContextMenuButtons();

    $('p[data-colour]').each(function() {
        const colour = $(this).data('colour');
        const cssStyle = colour === defaultTextColour ? 'color' : 'background-color';
        const cssColourHEX = colourNameToHex(colour === defaultTextColour ? defaultTextColour : `light${colour}`)
        $(this).css(cssStyle, cssColourHEX);
    });

    triggerContextMenuEvent($('.card-body > div'), true);
});

// Context Menu functions
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

    $('#cardHeightInput')
        .val(700)
        .on('input', () => adjustCardHeight() )
        .trigger('oninput');
    adjustCardHeight();

    $('#hide-all-colour-btn').on('click', function() { 
        const $target = $('.card-body p');
        rsidColourToggleVisibility(this, $target, isAll = true);
    });
}

const customFunc = function(e) {
    e.preventDefault();

    const $divContainer = $(this);
    const $btnGroup = $(`#${contextMenuID} .btn-group-vertical`);
    $btnGroup.find('.rsidButton').remove();

    $divContainer.find('p').each(function() {
        const $pTarget = $(this);
        const isVisible = $pTarget.hasClass('hidden-colour');
        const isMatchTextColour = $pTarget.data('colour') === defaultTextColour;
        const cssStyle = isMatchTextColour ? 'color' : 'background-color';
        let colourRGB = $pTarget.css(cssStyle);
        if (isVisible) {
            colourRGB = $pTarget.toggleClass('hidden-colour').css(cssStyle);
            $pTarget.toggleClass('hidden-colour');;
        }
        const colourHEX = rgbStringToHex(colourRGB)
        
        const $icon = $('<i>', {
            'data-id': `${contextMenuID}-colour-btn`,
            class: `fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'}`
        });

        const $text = $('<div>', {
            class: 'col-auto text',
            text: `${isVisible ? 'Unhide' : 'Hide'} Colour ${colourHEX}`
        });

        const $colorInput = $('<input>', {
            type: 'color',
            'data-id': 'color-picker',
            class: 'mt-1',
            value: colourHEX
        });

        const $row = $('<div>', {
            class: 'row',
            html: $('<div>', { class: 'col-auto ps-4' }).append($icon)
                .add($text)
                .add($('<div>', { class: 'col-auto' }).append($colorInput))
        });

        const $button = $('<button>', {
            class: 'btn btn-light text-start rsidButton py-0',
            type: 'button',
            html: $row
        });

        $btnGroup.append($button);

        $colorInput[isVisible ? 'hide': 'show']();
        $colorInput.on('input', function(){
            toggleButtonText($text, rgbStringToHex($pTarget.css(cssStyle)), $(this).val())
            $pTarget.css(cssStyle, $(this).val());
        });

        $button.click(function(e) {
            if (!$(e.target).closest("[data-id='color-picker']").length) {
                rsidColourToggleVisibility(this, $pTarget);
            }
            $button.find('[data-id=color-picker]')[$pTarget.hasClass('hidden-colour') ? 'hide': 'show']();
        });
    });

    showContextMenu(e);
};
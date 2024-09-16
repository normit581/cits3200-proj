const defaultFontSize = 16; // Default font size
const defaultTextColour = 'red'; // Default font size
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

// Helper function to replace only the text content (ignoring HTML tags)
function toggleButtonText(targetBtn, fromText, toText) {
    targetBtn = targetBtn.hasClass('rsidButton') ? targetBtn.find('.text') : targetBtn;
    $(targetBtn).contents().filter(function() {
        return this.nodeType === 3;  // Node type 3 is a text node
    }).each(function() {
        this.textContent = this.textContent.replace(fromText, toText);
    });
}

function rsidColourToggleVisibility(btn, target, isHideSiblings = false, hideText='Hide', showText='Show') {
    const $btn = $(btn);
    const $icon = $btn.find('i');
    
    const isHidden = $icon.hasClass('fa-eye-slash');
    const action = isHidden ? 'addClass' : 'removeClass';
    const reverseAction = isHidden ? 'removeClass' : 'addClass';
    
    $icon[action]('fa-eye')[reverseAction]('fa-eye-slash');

    toggleButtonText($btn, isHidden ? hideText : showText, isHidden ? showText : hideText);

    $(target)[action]('hidden-colour');

    if (isHideSiblings) {
        $btn.siblings('button.rsidButton').each(function() {
            if ($(this).data('is-match') === $(target).data('is-match')){
                const hideAction = isHidden ? 'hide' : 'show';
                const $siblingBtn = $(this);
                const $siblingIcon = $siblingBtn.find('i');
                toggleButtonText($siblingBtn, isHidden ? hideText : showText, isHidden ? showText : hideText);
                $siblingBtn.find('[data-id=color-picker]')[hideAction]();
                $siblingIcon[action]('fa-eye')[reverseAction]('fa-eye-slash');
            }
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
        const isMatch = $(this).data('is-match');
        const cssStyle = isMatch ? 'color' : 'background-color';
        const cssColourHEX = rgbStringToHex(colour)
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

    $('#hide-matching-colour-btn').on('click', function() { 
        const $target = $('.card-body p').not(`[data-is-match="false"]`);
        rsidColourToggleVisibility(this, $target, isHideSiblings = true);
    });

    $('#hide-individual-colour-btn').on('click', function() { 
        const $target = $('.card-body p').not(`[data-is-match="true"]`);
        rsidColourToggleVisibility(this, $target, isHideSiblings = true);
    });
}

const customFunc = function(e) {
    e.preventDefault();

    const $divContainer = $(this);
    const $btnGroup = $(`#${contextMenuID} .btn-group-vertical`);
    $btnGroup.find('.rsidButton').remove();

    let currentRSID = '';
    $divContainer.find('p').each(function() {
        const $pTarget = $(this);
        const rsid = $pTarget.data('rsid');
        const $rsidTargets = $(`p[data-rsid='${rsid}']`);
        if (currentRSID === rsid){
            return true; // continue
        }
        const isHidden = $pTarget.hasClass('hidden-colour');
        const isMatch = $pTarget.data('is-match');
        const cssStyle = isMatch ? 'color' : 'background-color';
        let colourRGB = $pTarget.css(cssStyle);
        if (isHidden) {
            // turn back visible to get correct colour
            colourRGB = $pTarget.toggleClass('hidden-colour').css(cssStyle);
            $pTarget.toggleClass('hidden-colour');
        }
        const colourHEX = rgbStringToHex(colourRGB)
        
        const $icon = $('<i>', {
            'data-id': `${contextMenuID}-colour-btn`,
            class: `fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}`
        });

        const $text = $('<div>', {
            class: 'col-auto text',
            text: `${isHidden ? 'Show' : 'Hide'} ${rsid} [${colourHEX}]`
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
        })
        .attr('data-is-match', $pTarget.data('is-match'))
        .attr('data-is-hidden', isHidden);

        $btnGroup.append($button);

        $colorInput[isHidden ? 'hide': 'show']();
        $colorInput.on('input', function(){
            toggleButtonText($text, rgbStringToHex($pTarget.css(cssStyle)), $(this).val())
            $rsidTargets.css(cssStyle, $(this).val());
        });

        $button.click(function(e) {
            if (!$(e.target).closest("[data-id='color-picker']").length) {
                rsidColourToggleVisibility(this, $rsidTargets);
            }
            $button.find('[data-id=color-picker]')[$pTarget.hasClass('hidden-colour') ? 'hide': 'show']();
        });
        currentRSID = rsid
    });

    showContextMenu(e);
};
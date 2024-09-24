const defaultFontSize = 16; // Default font size
const defaultTextColour = 'red'; // Default font size
let currentFontSize = defaultFontSize;
let longPressInterval;
const contextMenuID = 'custom-context-menu';
const rsidTextShowedArray = [];

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

function rsidTextToggleVisibility(isShow){
    const allElements = $('p[data-rsid]');
    const uniqueRsidGroups = [...new Set(allElements.map(function () {
        return $(this).attr('data-rsid');
    }).get())];

    uniqueRsidGroups.forEach(rsid => {
        const isRsidShown = rsidTextShowedArray.includes(rsid);
        if (isShow && !isRsidShown || !isShow && isRsidShown) {
            $(`p[data-rsid="${rsid}"]`).first().click();
        }
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

    if (!target) return;
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
        $('[data-bs-toggle="tooltip"]').each(function() {
            $(this).tooltip('update');
        });
    });
}

function adjustFontSize(direction) {
    currentFontSize = direction === 0 ? defaultFontSize : Math.max(10, Math.min(35, currentFontSize + direction));
    $('.card-body p').css('font-size', currentFontSize + 'px');
    $('.card-body span.pdf-rsid').css('font-size', currentFontSize + 'px');
}

function handleLongPress(action) {
    longPressInterval = setInterval(action, 100); // Adjusts every 100ms while pressed
}

function clearLongPress() {
    clearInterval(longPressInterval);
}

function pdfToggleElementsVisibility(isVisible) {
    const $contextMenu = $(`#${contextMenuID}`);
    const $visualiseResult = $("#visualise-result-container");
    const $tooltip = $('[role="tooltip"]');
    const $pdfRsids = $('span.pdf-rsid');

    const action = isVisible ? 'show' : 'hide';

    $visualiseResult.find(".card-body").toggleClass('pdf', !isVisible)
    $pdfRsids.toggleClass('pdf', !isVisible)
    $contextMenu[action]();
    $tooltip[action]();
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

    $('p[data-colour]').each(function() {
        const colour = $(this).data('colour');
        const isMatch = $(this).data('is-match');
        const rsid = $(this).data('rsid');
        const cssStyle = isMatch ? 'color' : 'background-color';
        const cssColourHEX = rgbStringToHex(colour)
        $(this).css(cssStyle, cssColourHEX);
        $(this).attr('title', rsid);
        $(this).attr('data-bs-toggle', 'tooltip');
    });

    // assign tooltip to each <p>
    $('#visualise-result-container div[data-position]').each(function() {
        const $div = $(this);
        const position = $div.data('position');
        const oppositePos = position === "left" ? "right" : "left";
        $div.find('p').each(function(){
            const $p = $(this);
            const rsid = $(this).data('rsid');
            const allMatchingSiblings = $div.find(`p[data-rsid='${rsid}']`).toArray();
            const triggerTargets = [$p[0], ...allMatchingSiblings];

            tippy(this, {
                content: `<strong>${rsid}</strong>`,
                placement: position,
                followCursor: 'vertical',
                trigger: 'click',
                hideOnClick: 'toggle',
                interactive: true,
                allowHTML: true,
                triggerTarget: triggerTargets,

                onShow(instance) {
                    if(getSelection().toString()){
                        return false;
                    }

                    if (!rsidTextShowedArray.includes(rsid)) {
                        rsidTextShowedArray.push(rsid); // Add rsid to the array
                        $(`div[data-position=${oppositePos}] p[data-rsid='${rsid}']`).first().click()
                    }

                    const tooltip = instance.popper;
                    
                    // Track mouse movement and check if the cursor is outside the boundary
                    const mouseMoveHandler = (event) => {
                        const pRect = $p[0].getBoundingClientRect();
                        const isOutside = event.clientX < pRect.left || event.clientX > pRect.right ||
                            event.clientY < pRect.top || event.clientY > pRect.bottom;

                        tooltip.classList.toggle('tooltip-cursor-out', isOutside); // Toggle class based on cursor position
                    };

                    document.addEventListener('mousemove', mouseMoveHandler);
                    instance.mouseMoveHandler = mouseMoveHandler;
                },
                onHide(instance) {
                    if(getSelection().toString()){
                        return false;
                    }
                    
                    const index = rsidTextShowedArray.indexOf(rsid);
                    if (index > -1) {
                        rsidTextShowedArray.splice(index, 1); // Remove rsid from the array
                        $(`div[data-position=${oppositePos}] p[data-rsid='${rsid}']`).first().click()
                    }
                    document.removeEventListener('mousemove', instance.mouseMoveHandler);
                }
            });
        });
    });

    // assign rsid for export pdf
    $('#visualise-result-container div.card-body > div').each(function() {
        const $div = $(this);
        const totalP =  $div.find('p').length;
        let currentRsid = $div.find('p').first().data('rsid');

        $div.find('p').each(function(idx){
            const $p = $(this);
            const rsid = $(this).data('rsid');
            const $span = $('<span class="pdf-rsid">')
            const $link = $('<a href="#"><i class="pe-1 fa fa-2xs fa-external-link"></i></a>');

            if (currentRsid !== rsid) {
                $span.text(`[${currentRsid}]`).insertBefore($p).append($link);
                currentRsid = rsid;
            }else if(idx === totalP - 1){
                $span.text(`[${rsid}]`).insertAfter($p).append($link);  
            }
        });
    });

    configureContextMenuButtons();
    triggerContextMenuEvent($('.card-body > div'), true);
});

function getTippyInstance(DOMselector){
    const tip = tippy(DOMselector);
    const el = document.querySelector(DOMselector)
    const popper = tip.getPopperElement(el);
    return popper
}

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

    $('#hide-text-btn').on('click', function() { 
        const isShow = $('#hide-text-btn').data('is-show')
        rsidColourToggleVisibility(this, null);
        rsidTextToggleVisibility(!isShow);
        $('#hide-text-btn').data('is-show', !isShow);
    });
    $('#hide-text-btn').attr('data-is-show', true);
    rsidTextToggleVisibility(true);
    
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

    let RSIDs = []; // tracks encountered RSIDs
    $divContainer.find('p').each(function() {
        const $pTarget = $(this);
        const rsid = $pTarget.data('rsid');
        const $rsidTargets = $(`p[data-rsid='${rsid}']`);

        // if rsid has already been processed, skip to the next one
        if (RSIDs.includes(rsid)) {
            return true; // continue
        }

        const isHidden = $pTarget.hasClass('hidden-colour');
        const isMatch = $pTarget.data('is-match');
        const cssStyle = isMatch ? 'color' : 'background-color';
        let colourRGB = $pTarget.css(cssStyle);
        if (isHidden) {
            // make visible to get the correct color, then hide again
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
        RSIDs.push(rsid);
    });

    showContextMenu(e);
};
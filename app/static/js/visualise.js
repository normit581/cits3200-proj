const defaultFontSize = 16; // Default font size
const defaultTextColour = 'red'; // Default font size
let currentFontSize = defaultFontSize;
let longPressInterval;
const contextMenuID = 'custom-context-menu';
const rsidTextShowedArray = [];
const overlay = new MyOverlay();
let currentNavigateIndexRSID = 0
let isCompleteRenderTooltip = false;

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

    overlay.startProgress(0.5, function(){
        uniqueRsidGroups.forEach(rsid => {
            const isRsidShown = rsidTextShowedArray.includes(rsid);
            if (isShow && !isRsidShown || !isShow && isRsidShown) {
                $(`p[data-rsid="${rsid}"]`).first().click();
            }
        })
        overlay.completeProgress()
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
        const $siblings = ($('#custom-context-menu .dropend').length === 1) ? 
            $btn.siblings('.dropend').find('.rsidButton') :
            $btn.siblings('button.rsidButton');
        $siblings.each(function() {
            if ($(this).data('is-match') === $(target).data('is-match')){
                const hideAction = isHidden ? 'hide' : 'show';
                const $siblingBtn = $(this);
                const $siblingIcon = $siblingBtn.find('i');
                toggleButtonText($siblingBtn, isHidden ? hideText : showText, isHidden ? showText : hideText);
                $siblingBtn.find('[data-id=color-picker]')[hideAction]();
                $siblingBtn[action]('py-1')[reverseAction]('py-0');
                $siblingIcon[action]('fa-eye')[reverseAction]('fa-eye-slash');
            }
        });
    } else {
        $btn[action]('py-1')[reverseAction]('py-0');
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
    const $docxSummaryCollapse = $('div.card-header .collapse');

    const action = isVisible ? 'show' : 'hide';

    $visualiseResult.find(".card-body").toggleClass('pdf', !isVisible);
    $pdfRsids.toggleClass('pdf', !isVisible);
    $docxSummaryCollapse[!isVisible ? 'addClass' : 'removeClass']('show');
    $contextMenu[action]();
    $tooltip[action]();

    const highlightedClass = isVisible ? 'pdf-highlighted' : 'highlighted';
    const $highlightedText = $(`p.highlighted, p.pdf-highlighted`);
    $highlightedText.removeClass('highlighted pdf-highlighted').addClass(highlightedClass);
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

function processInBatches($elements, batchSize, batchCallback, doneCallback) {
    let currentIndex = 0;

    function processBatch() {
        const batch = $elements.slice(currentIndex, currentIndex + batchSize);
        // Process the current batch
        batch.each(function () {
            batchCallback($(this));
        });

        currentIndex += batchSize;
        // If there are more elements to process, queue up the next batch
        if (currentIndex < $elements.length) {
            setTimeout(processBatch, 0); // 0 ms timeout to yield to the event loop
        } else if (doneCallback) {
            doneCallback(); // Call the done callback when all batches are processed
        }
    }
    processBatch(); // Start the batch processing
}

$(document).ready(function() {
    $(`nav`).hide();
    $(`#${contextMenuID}`).hide();
    $('p[data-colour]').each(function() {
        const colour = $(this).data('colour');
        const isMatch = $(this).data('is-match');
        const rsid = $(this).data('rsid');
        const cssStyle = isMatch ? 'color' : 'background-color';
        const cssColourHEX = rgbStringToHex(colour)
        $(this).css(cssStyle, cssColourHEX);
        $(this).attr('title', rsid);
        $(this).attr('aria-expanded', true)
    });

    // assign tooltip to each <p>
    const $allParagraphs = $('#visualise-result-container p[data-rsid]'); // Get all <p> elements
    overlay.startProgress(0.5, processInBatches($allParagraphs, 50, function ($p) { 
        const rsid = $p.data('rsid');
        const position = $p.closest('div[data-position]').data('position');
        const oppositePos = position === "left" ? "right" : "left";
        const allMatchingSiblings = $p.closest('div[data-position]').find(`p[data-rsid='${rsid}']`).toArray();
        const triggerTargets = [$p[0], ...allMatchingSiblings];

        tippy($p[0], {
            content: `<strong>${rsid}</strong>`,
            placement: oppositePos,
            followCursor: 'vertical',
            trigger: 'click',
            hideOnClick: 'toggle',
            interactive: true,
            allowHTML: true,
            triggerTarget: triggerTargets,
            showOnCreate: true,
            onCreate(instance) {
              instance.popper.classList.add('tooltip-temp-hidden');
            },
            onShow(instance) {
                if(getSelection().toString()) return false;
                if (!rsidTextShowedArray.includes(rsid)) {
                    rsidTextShowedArray.push(rsid); // Add rsid to the array
                    $(`div[data-position=${oppositePos}] p[data-rsid='${rsid}']`).first().click()
                }

                const tooltip = instance.popper;
                // Track mouse movement and check if the cursor is outside the boundary
                const mouseMoveHandler = (event) => {
                    if (isCompleteRenderTooltip) {
                        $('div[data-tippy-root]').removeClass('tooltip-temp-hidden');
                        isCompleteRenderTooltip = false;
                    }
                    const pRect = $p[0].getBoundingClientRect();
                    const isOutside = event.clientX < pRect.left || event.clientX > pRect.right ||
                        event.clientY < pRect.top || event.clientY > pRect.bottom;
                    tooltip.classList.toggle('tooltip-cursor-out', isOutside); // Toggle class based on cursor position
                };
                document.addEventListener('mousemove', mouseMoveHandler);
                instance.mouseMoveHandler = mouseMoveHandler;
            },
            onHide(instance) {
                if(getSelection().toString()) return false;                
                const index = rsidTextShowedArray.indexOf(rsid);
                if (index > -1) {
                    rsidTextShowedArray.splice(index, 1); // Remove rsid from the array
                    $(`div[data-position=${oppositePos}] p[data-rsid='${rsid}']`).first().click()
                }
                document.removeEventListener('mousemove', instance.mouseMoveHandler);
            }
        });
    }, function () { // doneCallback
        overlay.completeProgress();
        isCompleteRenderTooltip = true;
        configureContextMenuButtons();
        triggerContextMenuEvent($('.card-body > div'), true);
    }));

    // assign rsid for export pdf
    $('#visualise-result-container div.card-body > div').each(function() {
        const $div = $(this);
        const totalP =  $div.find('p').length;
        let currentRsid = $div.find('p').first().data('rsid');

        $div.find('p').each(function(idx){
            const $p = $(this);
            const rsid = $(this).data('rsid');
            const $span = $('<span class="pdf-rsid">')
            // const $link = $('<a href="#"><i class="pe-1 fa fa-2xs fa-external-link"></i></a>');
            const $link = '';

            if (currentRsid !== rsid) {
                $span.text(`[${currentRsid}]`).insertBefore($p).append($link);
                currentRsid = rsid;
            }else if(idx === totalP - 1){
                $span.text(`[${rsid}]`).insertAfter($p).append($link);  
            }
        });
    });

    $(document).on('mouseup', function (e) {
        if ($(e.target).closest(`#${contextMenuID}`).length) {
            return;
        }
        $('p[data-rsid]').removeClass('highlighted');
        const selection = document.getSelection();
        if (!selection.isCollapsed) { // Ensure there is a selection
            const range = selection.getRangeAt(0);  // Get the selected range
            const commonAncestor = range.commonAncestorContainer.nodeType === 3 
                                   ? range.commonAncestorContainer.parentNode  // If it's text, get its parent node
                                   : range.commonAncestorContainer;
            // Find all <p> elements within the common ancestor
            const $paragraphs = $(commonAncestor).find('p').addBack('p');
            $paragraphs.each(function() {
                const $p = $(this);
                // Check if the paragraph is at least partially within the selection
                if (selection.containsNode(this, true)) { 
                    const rsid = $p.data('rsid');
                    $(`p[data-rsid='${rsid}']`).addClass('highlighted');
                }
            });
        }
    });
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

    $('#hide-text-btn').on('click', function() { 
        const isShow = $('#hide-text-btn').data('is-show')
        rsidColourToggleVisibility(this, null);
        rsidTextToggleVisibility(!isShow);
        $('#hide-text-btn').data('is-show', !isShow);
    });
    $('#hide-text-btn').attr('data-is-show', true);
    
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
    $('p[data-rsid]').removeClass('highlighted');
    const $ele = $(e.target);
    if ($ele.is('[data-rsid]')) {
        const rsid = $ele.data('rsid'); // Retrieve the value of data-rsid
        $(`p[data-rsid='${rsid}']`).addClass('highlighted');
    }
    
    const $divContainer = $(this);
    const uniqueRSIDs = [...new Set($divContainer.find('p').map(function() {
        return $(this).data('rsid');
    }).get())];

    const buttonDisplay = uniqueRSIDs.length > 5 ? 
        renderDropEndButtons($divContainer) : 
        renderButtons($divContainer);
    // Append dropend and individual buttons to the appropriate group
    const $btnGroup = $(`#${contextMenuID} .btn-group-vertical`);
    $btnGroup.find('.dropend').remove();
    $btnGroup.find('.rsidButton').remove();
    $btnGroup.append(buttonDisplay);

    // Show context menu after buttons are rendered
    showContextMenu(e);
};

function renderDropEndButtons($divContainer) {
    const $dropdown = $('<div>', { class: 'btn-group dropend' });
    const $dropdownButton = $('<button>', {
        class: 'btn btn-secondary dropdown-toggle',
        type: 'button',
        'data-bs-offset': [0,1],
        'data-bs-toggle': 'dropdown',
        'data-bs-auto-close': 'false',
        'aria-expanded': 'false',
        text: 'Update Individual Colour'
    });
    const $ul = $('<ul>', { class: 'dropdown-menu p-0' });
    
    let RSIDs = [];
    $divContainer.find('p').each(function() {
        const $pTarget = $(this);
        const rsid = $pTarget.data('rsid');
        const $rsidTargets = $(`p[data-rsid='${rsid}']`);

        if (RSIDs.includes(rsid)) {
            return true; // continue
        }

        const isHidden = $pTarget.hasClass('hidden-colour');
        const isMatch = $pTarget.data('is-match');
        const cssStyle = isMatch ? 'color' : 'background-color';
        let colourRGB = $pTarget.css(cssStyle);
        if (isHidden) {
            colourRGB = $pTarget.toggleClass('hidden-colour').css(cssStyle);
            $pTarget.toggleClass('hidden-colour');
        }
        const colourHEX = rgbStringToHex(colourRGB);

        const $icon = $('<i>', {
            'data-id': `${contextMenuID}-colour-btn`,
            class: `fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}`
        });

        const $text = $('<div>', {
            class: 'me-1 text',
            text: `${isHidden ? 'Show' : 'Hide'}`
        });

        const $rsidText = $('<div>', {
            class: 'me-1 char-evenly-space',
            text: `${rsid}`
        });

        const $colorInput = $('<input>', {
            type: 'color',
            'data-id': 'color-picker',
            value: colourHEX
        });

        const $hexColourText = $('<div>', {
            class: 'char-evenly-space',
            text: `[${colourHEX}]`
        });

        const $dflex = $('<div>', {
            class: 'd-flex align-items-center',
            html: $('<div>', { class: 'me-1' }).append($icon)
                .add($text).add($rsidText)
                .add($('<div>', { class: 'me-1 mt-2' }).append($colorInput))
                .add($hexColourText)
        });

        const $button = $('<button>', {
            class: 'btn btn-light text-start rsidButton w-100',
            type: 'button',
            html: $dflex
        })
        .attr('data-is-match', $pTarget.data('is-match'))
        .attr('data-is-hidden', isHidden);
        isHidden ? $button.addClass('py-1') : $button.addClass('py-0');
        
        const $li = $('<li>').append($button);
        $ul.append($li);

        // Add functionality to the color input and button
        $colorInput[isHidden ? 'hide': 'show']();
        $colorInput.on('input', function() {
            toggleButtonText($hexColourText, rgbStringToHex($pTarget.css(cssStyle)), $(this).val());
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
    
    if (RSIDs.length > 12) $ul.addClass('add-scroll');
    $dropdown.append($dropdownButton).append($ul);
    return $dropdown;
}

function renderButtons($divContainer) {
    let RSIDs = [];
    const $fragment = $(document.createDocumentFragment());

    $divContainer.find('p').each(function() {
        const $pTarget = $(this);
        const rsid = $pTarget.data('rsid');
        const $rsidTargets = $(`p[data-rsid='${rsid}']`);

        if (RSIDs.includes(rsid)) {
            return true; // continue
        }

        const isHidden = $pTarget.hasClass('hidden-colour');
        const isMatch = $pTarget.data('is-match');
        const cssStyle = isMatch ? 'color' : 'background-color';
        let colourRGB = $pTarget.css(cssStyle);
        if (isHidden) {
            colourRGB = $pTarget.toggleClass('hidden-colour').css(cssStyle);
            $pTarget.toggleClass('hidden-colour');
        }
        const colourHEX = rgbStringToHex(colourRGB);

        const $icon = $('<i>', {
            'data-id': `${contextMenuID}-colour-btn`,
            class: `fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}`
        });

        const $text = $('<div>', {
            class: 'col-auto text',
            text: `${isHidden ? 'Show' : 'Hide'}`
        });

        const $rsidText = $('<div>', {
            class: 'col-auto char-evenly-space',
            text: `${rsid}`
        });

        const $colorInput = $('<input>', {
            type: 'color',
            'data-id': 'color-picker',
            class: 'mt-1',
            value: colourHEX
        });

        const $hexColourText = $('<div>', {
            class: 'col-auto char-evenly-space',
            text: `[${colourHEX}]`
        });

        const $row = $('<div>', {
            class: 'row',
            html: $('<div>', { class: 'col-auto ps-4' }).append($icon)
                .add($text).add($rsidText)
                .add($('<div>', { class: 'col-auto' }).append($colorInput))
                .add($hexColourText)
        });

        const $button = $('<button>', {
            class: 'btn btn-light text-start rsidButton',
            type: 'button',
            html: $row
        })
        .attr('data-is-match', $pTarget.data('is-match'))
        .attr('data-is-hidden', isHidden);
        isHidden ? $button.addClass('py-1') : $button.addClass('py-0');

        $fragment.append($button);

        $colorInput[isHidden ? 'hide': 'show']();
        $colorInput.on('input', function() {
            toggleButtonText($hexColourText, rgbStringToHex($pTarget.css(cssStyle)), $(this).val());
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

    return $fragment;
}
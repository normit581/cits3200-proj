const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
const maxFiles = 20;
const maxFileSize = 100 * 1024 * 1024; //100MB
const maxTotalSize = maxFiles * maxFileSize;
const contextMenuID = 'custom-context-menu';
const dangerPercentage = 60, warningPercentage = 30
const overlay = new MyOverlay();

function toggleFileList(isOpen) {
    const fileListWidth = isOpen ? "15%" : "0%";
    const dropZoneWidth = isOpen ? "85%" : "100%";
    $("#file-list").css("width", fileListWidth);
    $("#drop-zone").css("width", dropZoneWidth);
}

function handleFileList(change) {
    numFiles += change;
    toggleFileList(numFiles > 0);
}

function deleteListItem(e) {
    const { itemId, filename } = e.data;
    const $listItem = $(`#list-item-${itemId}`);

    const $matchingWarnings = $('aside span').filter(function() {
        return $(this).find('p').text().trim() === $listItem.find('p').text().trim();
    });

    if ($matchingWarnings.length > 1) {
        if(!confirm("Note that all duplicated file name with warning will be removed. Continue?")){
            return false;
        }
        $matchingWarnings.last().find('i.fa-triangle-exclamation').remove();
        // Remove all but the last one
        $matchingWarnings.slice(0, -1).each(function() {
            $(this).tooltip('dispose'); // Dispose tooltips before removing
            $(this).remove(); // Remove the element
        });
    } else{
        $listItem.tooltip('dispose');
        $listItem.remove();
        currentFiles.delete(filename);
    }

    handleFileList(-1);
    updateFileInput();
    updateProgressBar();
}

function createListItem(name) {
    const filename = fileNameWithoutExt(name);

    const delIcon = $('<i>')
        .addClass('bi bi-trash3')
        .click({ itemId: fileId, filename }, deleteListItem);

    const para = $('<p>').text(name);

    let warningIcon = '';
    if (currentFiles.has(filename)){
        warningIcon = $('<i>')
            .attr('title', 'duplicate file detected')
            .addClass('fa-solid fa-triangle-exclamation text-warning mt-1 mx-auto text-center');
    }

    const item = $('<span>')
        .attr({
            'data-bs-toggle': 'tooltip',
            'data-bs-title': name,
            'data-bs-placement': 'right',
            'id': `list-item-${fileId}`
        })
        .addClass('d-flex justify-content-between')
        .tooltip()
        .append(warningIcon, para, delIcon);

    fileId++;
    return item;
}

function applyConfirmAnimation() {
    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.add('confirm-animation');
    setTimeout(() => {
        dropZone.classList.remove('confirm-animation');
    }, 500);
}

function fileNameWithoutExt(fileName){
    return fileName.replace(/\.[^/.]+$/, "");
}

function validateMatchForm(){
    const formData = new FormData();
    let isValid = true;

    currentFiles.forEach((file, idx) => {
        if (validateFile(file)) {
            formData.append('files', file);
        } else {
            isValid = false;
            currentFiles.delete(fileNameWithoutExt(file.name));
            $(`#list-item-${id}`).remove();
            handleFileList(-1);
        }
    });

    if (!isValid) {
        GenerateDangerAlertDiv('Failed!', 'Some files were removed due to validation errors. Please check and try again.');
        updateProgressBar();
        return;
    }
    formData.append('csrf_token', $('input[name=csrf_token]').val());
    return formData;
}

function validateFile(file) {
    if (file.type !== docxExtension) {
        GenerateDangerAlertDiv("Failed!", 'Only .docx files are allowed.');
        return false;
    }
    if (file.size > maxFileSize) {
        GenerateDangerAlertDiv("Failed!", `File ${file.name} exceeds the maximum size of 100MB.`);
        return false;
    }
    return true;
}

function updateTotalSize() {
    return Array.from(currentFiles.values()).reduce((sum, file) => sum + file.size, 0);
}

function updateProgressBar() {
    const progressBar = $('#progress-bar');
    const submitBtn = $('#submit-btn');
    const progress = (numFiles / maxFiles) * 100;

    progressBar.css('width', `${progress}%`);
    progressBar.attr('aria-valuenow', progress);
    progressBar.text(`${numFiles}/${maxFiles} DOCX`);

    const successClass = 'bg-success';
    progressBar.toggleClass(successClass, progress === 100);
    submitBtn.toggleClass(successClass, progress === 100);
}

function handleFiles(files) {
    const $fileList = $('#file-list');

    $.each(files, (index, file) => {
        if (!validateFile(file)) return;

        if (currentFiles.size >= maxFiles) {
            alert(`Maximum of ${maxFiles} files reached.`);
            return false;
        }

        const newTotalSize = updateTotalSize() + file.size;
        if (newTotalSize > maxTotalSize) {
            alert("Total file size exceeds the maximum of 200MB.");
            return false;
        }

        handleFileList(1);
        const item = createListItem(file.name);
        $fileList.append(item);

        currentFiles.set(fileNameWithoutExt(file.name), file);

        updateFileInput();
        applyConfirmAnimation();
        updateProgressBar();
    });
}

function setFileEvents() {
    const $fileInput = $('#files');
    $fileInput.on('change', (e) => handleFiles(e.target.files));

    const $dropZone = $('#drop-zone');
    $dropZone.on('click', () => $fileInput.click())
        .on('dragover', (e) => {
            e.preventDefault();
            $dropZone.addClass('dragover');
        })
        .on('dragleave drop', (e) => {
            e.preventDefault();
            $dropZone.removeClass('dragover');
            if (e.type === 'drop') {
                const files = e.originalEvent.dataTransfer.files;
                handleFiles(files);
            }
        });
}

function updateFileInput() {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => dataTransfer.items.add(file));
    $('#files')[0].files = dataTransfer.files;
}

const onXhrMatch = () => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (evt) => {
        if (evt.lengthComputable) {
            const percentComplete = (evt.loaded / evt.total) * 100;
            $('#upload-progress').css('width', `${percentComplete}%`).attr('aria-valuenow', percentComplete);
        }
    }, false);
    return xhr;
};

const onErrorMatch = (xhr) => {
    let responseText = "An error occurred.";
    switch (xhr.status) {
        case 404:
            responseText = 'The uploaded files are too large. Please try again with smaller files.';
            break;
        case 400:
            responseText = 'Invalid request. Please check your files and try again.';
            const responseJSON = xhr.responseJSON;
            if (responseJSON && responseJSON.message){
                responseText = responseJSON.message;
            }
            break;
    }
    overlay.completeProgress();
    GenerateDangerAlertDiv("Failed!", `ErrorCode: ${xhr.status}. ${responseText}`);
};

const onSuccessMatch = (response) => {
    if (response.success) {
        ScrollToTopPage();
        appendMatchResults(response.data);
        setupVisualiseForm();
        $("#setting-bar-container").show();
        $("#upload-container").hide();
        triggerContextMenuEvent($('main'), true);
        overlay.completeProgress();
    } else {
        GenerateDangerAlertDiv("Failed!", response.message);
    }
};

function match() {
    if (currentFiles.size === 0) {
        GenerateDangerAlertDiv('Failed!', 'Please add at least one file.');
        return;
    }

    const $warningItems = $('aside span').find('i.fa-triangle-exclamation');
    if ($warningItems.length > 0) {
        if(!confirm("Duplicate detected. Do you wish to continue?")){
            return false; // Cancel form submission
        }
    }

    $('#similarity-result').empty();
    overlay.startProgress(0.5);
    CallPost(`/home`, validateMatchForm(), onSuccessMatch, onErrorMatch, onXhrMatch);
}

function appendMatchResults(similarityResults) {
    const $row = $('<div>', { class: 'row'});
    const $aside = $('<aside>', { class: 'col-2' }).append(
        $('<div>', {
            class: 'btn-group-vertical col-12 shaded',
            role: 'group',
            'aria-label': 'Vertical radio toggle button group'
        })
    );

    const $gridContainer = $('<div>', { class: 'col-10 hidden', 'data-view-name' : "grid"  });
    $.each(similarityResults, (key, values) => {
        const keyId = `${key}-${Object.keys(similarityResults).indexOf(key)}`;
        const $mainContent = $('<div>', {
            class: 'row card-docx-container hidden',
            'data-id': keyId
        });

        const radioId = `vbtn-radio-${keyId}`;
        const $radioInput = $('<input>', {
            type: 'radio',
            class: 'btn-check',
            name: 'vbtn-radio',
            id: radioId,
            autocomplete: 'off',
            'data-target': keyId
        });
        const $radioLabel = $('<label>', {
            class: 'btn btn-outline-secondary text-truncate mt-0',
            for: radioId
        }).text(key);

        $aside.find('.btn-group-vertical').append($radioInput).append($radioLabel);
        // Iterate over each value in the results
        $.each(values, (i, item) => {
            const matchPercent = parseFloat(item.value);
            const matchCount = item.count, fileName = item.filename;
            const borderColour =
                matchPercent < warningPercentage ? 'border-success' :
                matchPercent < dangerPercentage ? 'border-warning' : 'border-danger';

            // Create card structure
            const $card = $('<div>', {
                class: 'card-docx-display card col-3',
                'data-base-file': key,
                'data-compare-file': item.filename, 
                'data-match-percent': item.value,
                'data-base-count': similarityResults[item.filename].find(item => item.filename === key).count,
                'data-compare-count': item.count,
                'data-common-count': item.common_count
            });
            $card.append(
                $('<div>', { class: 'card shaded' }).append(
                    $('<div>', { class: `card-body border border-4 rounded-1 ${borderColour}` }).append(
                        $('<h4>', { class: 'text-truncate' }).text(fileName),
                        $('<hr>'),
                        $('<div>', { class: 'd-flex justify-content-between' }).append(
                            $('<span>').text(`${matchPercent.toFixed(1)}%`),
                            $('<div>', { class: 'text-truncate' }).append(
                                $('<i>', { class: 'fa-solid fa-hashtag me-1' }),
                                $('<span>').text(matchCount)
                            )
                        )
                    )
                )
            );
            $mainContent.append($card);
        });
        $gridContainer.append($mainContent);
    });

    const $listContainer = $('<div>', { class: 'col-10', 'data-view-name': "list" });
    $.each(similarityResults, (key, values) => {
        const keyId = `${key}-${Object.keys(similarityResults).indexOf(key)}`;
        const $mainContent = $('<div>', {
            class: 'card-docx-container-list list-group rounded-0 hidden',
            'data-id': keyId
        });

        $.each(values, (i, item) => {
            const matchPercent = parseFloat(item.value);
            const matchCount = item.count, fileName = item.filename;
            const borderColour =
                matchPercent < warningPercentage ? 'border-success' :
                matchPercent < dangerPercentage ? 'border-warning' : 'border-danger';

            const badgeColour =
                matchPercent < warningPercentage ? 'bg-success' :
                matchPercent < dangerPercentage ? 'bg-warning' : 'bg-danger';
            const $row = $('<div>', {
                class: `list-group-item d-flex justify-content-between align-items-center ${borderColour}`,
                'data-base-file': key,
                'data-compare-file': fileName,
                'data-match-percent': matchPercent,
                'data-base-count': similarityResults[item.filename].find(item => item.filename === key).count,
                'data-compare-count': matchCount,
                'data-common-count': item.common_count
            });
            const $fileInfo = $('<div>', { class: 'd-flex align-items-center flex-grow-1 file-info' }).append(
                $('<i>', { class: 'fa-solid fa-file me-3' }),
                $('<span>', { class: 'file-name text-truncate' }).text(fileName)
            );
            const $matchInfo = $('<div>', { class: 'match-info d-flex align-items-center' }).append(
                $('<span>', { class: 'text-muted me-3 match-count' }).append(
                    $('<i>', { class: 'fa-solid fa-hashtag me-1' }),
                    matchCount
                ),
                $('<span>', { class: `badge bg-primary me-2 ${badgeColour} fixed-width-badge` }).text(matchPercent === 0 ? '00.0%' : `${matchPercent.toFixed(1)}%`) // Match percentage
            );
            $row.append($fileInfo, $matchInfo);
            $mainContent.append($row);
        });
        $listContainer.append($mainContent);
    });

    $row.append($aside).append($gridContainer).append($listContainer);
    $('#similarity-result').append($row);
    $("#similarity-result").show();

    const $similarityResultView = $('#similarity-result');
    $similarityResultView.find('.btn-group-vertical input').click(function() {
        const target = $(this).data('target');
        $similarityResultView.find('.card-docx-container').addClass('hidden'); // Hide all grid containers
        $similarityResultView.find('.card-docx-container-list').addClass('hidden'); // Hide all list containers
        $similarityResultView.find(`.card-docx-container[data-id="${target}"]`).removeClass('hidden'); // Show the selected grid container
        $similarityResultView.find(`.card-docx-container-list[data-id="${target}"]`).removeClass('hidden'); // Show the selected list container
    });
    $aside.find('input').first().click();
   // sortListView();
}

function setupVisualiseForm() {
    $('#base_count').val($('.card-docx-container .card-body').first().parents('.card-docx-display').first().data("base-count-file"))
    $('.card-docx-container .card-body').on('click', function() {
        const $card_docx = $(this).parents('.card-docx-display').first();
        const setBaseFile = setFileInput($card_docx.data("base-file"), "#base_file");
        const setCompareFile = setFileInput($card_docx.data("compare-file"), "#compare_file");
        $('#base_count').val($card_docx.data("base-count"))
        $('#compare_count').val($card_docx.data("compare-count"))
        $('#common_count').val($card_docx.data("common-count"))

        if (setBaseFile && setCompareFile) {
            $("#visualise-form").submit();
        }
    });

    $('.card-docx-container-list .list-group-item').on('click', function() {
        const $row = $(this);
        const setBaseFile = setFileInput($row.data("base-file"), "#base_file");
        const setCompareFile = setFileInput($row.data("compare-file"), "#compare_file");
        $('#base_count').val($row.data("base-count"))
        $('#compare_count').val($row.data("compare-count"))
        $('#common_count').val($row.data("common-count"))

        if (setBaseFile && setCompareFile) {
            $("#visualise-form").submit();
        }
    });
}

function setFileInput(filename, inputID) {
    const key = fileNameWithoutExt(filename);
    const fileData = currentFiles.get(key);
    if (!fileData) {
        GenerateDangerAlertDiv("Failed!", `File: ${filename} not found. Please try reupload.`);
        return false;
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(fileData);
    $(`${inputID}`)[0].files = dataTransfer.files;
    return true;
}

function showRefreshAlert(event) {
    const message = "Changes you made may not be saved.";
    event.preventDefault();
    event.returnValue = message;
    return message;
}

function reuploadFiles() {
    CloseAlertDiv();
    $('#upload-container').show();
    $("#similarity-result").hide();
    $("#reupload-container").hide();
    $('#setting-bar-container').hide();
    ScrollToTopPage();
    triggerContextMenuEvent($('main'), false);
}

function toggleElementsVisibility(isVisible) {
    const $navBar = $("nav");
    const $settingBar = $("#setting-bar-container");
    const $similarityResult = $("#similarity-result");
    const $similarityResultAside = $similarityResult.find("aside");
    const $similarityResultGridDiv = $similarityResultAside.next();
    const $similarityResultListDiv = $similarityResultGridDiv.next();
    const $contextMenu = $(`#${contextMenuID}`);

    const action = isVisible ? 'show' : 'hide';
    const containerClass = isVisible ? "container" : "container-fluid";
    const colClass = isVisible ? "col-10" : "col-12";

    $navBar[action]();
    $settingBar[action]();
    $similarityResult.attr("class", containerClass);
    if (!$similarityResultGridDiv.hasClass('hidden')){
        $similarityResultGridDiv
            .attr("class", colClass)
            .find(".card-docx-container")
                .toggleClass('pdf', !isVisible)
            .find("> div")
                .toggleClass('pdf disable-hover', !isVisible)
    }

    if (!$similarityResultListDiv.hasClass('hidden')){
        $similarityResultListDiv
            .attr("class", colClass)
            .find(".card-docx-container-list")
                .toggleClass('pdf', !isVisible)
            .find("> a")
                .toggleClass('disable-hover', !isVisible);
    }
    $similarityResultAside[action]();
    $contextMenu[action]();
}

function exportPDF() {
    toggleElementsVisibility(false);
    window.print();
    toggleElementsVisibility(true);
}

function exportSinglePDF() {
    const $checkedResult = $('[name="vbtn-radio"]:checked');
    if ($checkedResult.length == 0) {
        GenerateDangerAlertDiv('Failed', 'Please select a document from the result side bar.');
        return;
    }
    generateTitlePDF($checkedResult);
    exportPDF();
    generateTitlePDF($('[name="vbtn-radio"]:checked'))
    destroyTitlePDF();
}

function exportAllPDF(){
    $.each($('[name="vbtn-radio"]'), function(idx, asideElement) {
        generateTitlePDF(asideElement)
    });
    exportPDF();
    destroyTitlePDF();
}

function destroyTitlePDF() {
    $('div[data-result-docx-title]').remove();
    $('[name="vbtn-radio"]:not(:checked)').each(function(idx, asideElement) {
        const selectedInputId = $(asideElement).attr('data-target');
        const divIdGrid = `#similarity-result div[data-view-name='grid'] [data-id='${selectedInputId}']`;
        const divIdList = `#similarity-result div[data-view-name='list'] > div[data-id='${selectedInputId}']`;
        $(divIdGrid).addClass('hidden');
        $(divIdList).addClass('hidden');
    });
}

function generateTitlePDF(element) {
    const selectedInputId = $(element).attr('data-target');
    const selectedLabel = $(element).next().text();
    const titleHTML = $(`<div data-result-docx-title="${selectedLabel}" class="h1 text-center mt-3"></div>`).text(selectedLabel);

    const divIdGrid = `#similarity-result div[data-view-name='grid'] [data-id='${selectedInputId}']`;
    const divIdList = `#similarity-result div[data-view-name='list'] > div[data-id='${selectedInputId}']`;
    $(divIdGrid).removeClass('hidden');
    if ($(divIdGrid).children('div').not('.hidden').length > 0) {
        $(titleHTML).insertBefore(divIdGrid);
    }
    $(divIdList).removeClass('hidden');
    if ($(divIdList).children('div').not('.hidden').length > 0) {
        $(titleHTML.clone()).insertBefore(divIdList);
    }
}

function updateFilter(value) {
    const minValue = parseFloat(value);
    $('#matchSlider').val(minValue);
    $('#matchInput').val(minValue);
    $('#similarity-result .card-docx-display, #similarity-result .card-docx-container-list > div').each(function() {
        const matchPercent = parseFloat($(this).data('match-percent'));
        const action = matchPercent >= minValue ? 'removeClass' : 'addClass';
        $(this)[action]('hidden');
    });
};

function updateResultView(button){
    const $button = $(button);
    const viewName = $button.data('view-name');
    $('#similarity-result div[data-view-name]').addClass('hidden');
    $(`#similarity-result div[data-view-name='${viewName}']`).removeClass('hidden');
    $('#grid-view-btn').toggleClass('hidden');
    $('#list-view-btn').toggleClass('hidden');
}

let sortModes = [
    { mode: 'matchDesc', label: 'Sort by Match % Descending', icon: 'fa-sort-amount-down' },
    { mode: 'matchAsc', label: 'Sort by Match % Ascending', icon: 'fa-sort-amount-up' },
    { mode: 'filenameAsc', label: 'Sort by Filename A-Z', icon: 'fa-sort-alpha-down' },
    { mode: 'filenameDesc', label: 'Sort by Filename Z-A', icon: 'fa-sort-alpha-up' }
];
let currentSortIndex = 0;

function sortListView() {
    const currentSortMode = sortModes[currentSortIndex];
    $('#similarity-result .card-docx-container-list').each(function() {
        const $container = $(this);
        const $items = $container.children('.list-group-item').get();
        $items.sort(function(a, b) {
            switch (currentSortMode.mode) {
                case 'matchDesc':
                    return parseFloat($(b).data('match-percent')) - parseFloat($(a).data('match-percent'));
                case 'matchAsc':
                    return parseFloat($(a).data('match-percent')) - parseFloat($(b).data('match-percent'));
                case 'filenameAsc':
                    return $(a).data('compare-file').localeCompare($(b).data('compare-file'), undefined, {numeric: true, sensitivity: 'base'});
                case 'filenameDesc':
                    return $(b).data('compare-file').localeCompare($(a).data('compare-file'), undefined, {numeric: true, sensitivity: 'base'});
                default:
                    return 0;
            }
        });
        $.each($items, function(idx, item) {
            $container.append(item);
        });
    });
    currentSortIndex = (currentSortIndex + 1) % sortModes.length; // Cycle to next sort mode
    const nextSortMode = sortModes[currentSortIndex];
    $('#sort-btn').html(`<i class="fa-solid ${nextSortMode.icon}"></i> ${nextSortMode.label}`);
}

$(document).ready(function() {
    $(window).on('beforeunload', showRefreshAlert);
    configureContextMenuButtons();
    setFileEvents();
    toggleFileList(false);

    $('#match-form').on('submit', function(e) {
        e.preventDefault();
        match();
    });

    $('#setting-bar-container').hide()
});

// Context Menu functions
function configureContextMenuButtons(){
    $('#reupload-btn').on('click', () => reuploadFiles());

    $('#grid-view-btn').on('click', (e) => updateResultView(e.target));
    $('#list-view-btn').on('click', (e) => updateResultView(e.target));
    $('#sort-btn').on('click', () => sortListView());
    // Set default sort mode
    $('#sort-btn').html(`<i class="fa-solid ${sortModes[currentSortIndex].icon}"></i> ${sortModes[currentSortIndex].label}`);
    $('#list-view-btn').addClass('hidden');

    $('#pdf-btn').on('click', () => exportSinglePDF());

    $('#all-pdf-btn').on('click', () => exportAllPDF());
    
    $('#custom-context-menu .input-group')
        .on('mouseenter', function() { $(this).find('button').addClass('active'); })
        .on('mouseleave', function() { $(this).find('button').removeClass('active'); });
    $('#matchSlider').on('input', (e) => updateFilter(e.target.value));
    $('#matchInput').on('input', (e) => updateFilter(e.target.value));
}

const customFunc = function(e) {
    e.preventDefault();
    const selectedLabel = $('#similarity-result aside input:checked').next().text();
    $('#pdf-btn').html(`<i class="fa-solid fa-file-export"></i> ${selectedLabel} PDF`);
    showContextMenu(e);
};

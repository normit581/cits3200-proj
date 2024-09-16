const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
const maxFiles = 2;
const maxFileSize = 100 * 1024 * 1024; //100MB
const maxTotalSize = maxFiles * maxFileSize;
const contextMenuID = 'custom-context-menu';

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
    CallPost(`/home`, validateMatchForm(), onSuccessMatch, onErrorMatch, onXhrMatch);
}

function appendMatchResults(similarityResults) {
    const row = $('<div class="row"></div>');
    const aside = $('<aside class="col-2"><div class="btn-group-vertical col-12 shaded" role="group" aria-label="Vertical radio toggle button group"></div></aside>');
    const container = $('<div class="col-10"></div>');

    $.each(similarityResults, (key, values) => {
        const keyId = `${key}-${Object.keys(similarityResults).indexOf(key)}`;
        const mainContent = $('<div class="row card-docx-container hidden"></div>').attr('data-id', keyId);
        const radioId = `vbtn-radio-${keyId}`;
        const radioInput = $('<input type="radio" class="btn-check">')
            .attr({ name: 'vbtn-radio', id: radioId, autocomplete: 'off', 'data-target': keyId });
        const radioLabel = $('<label class="btn btn-outline-secondary text-truncate mt-0"></label>')
            .attr('for', radioId)
            .text(key);

        aside.find('.btn-group-vertical').append(radioInput).append(radioLabel);

        $.each(values, (i, item) => {
            const card = $(`<div class="card-docx-display card col-3"></div>`)
                .attr({ 'data-base-file': key, 'data-compare-file': item.filename });
            card.append(
                $('<div class="card shaded"></div>').append(
                    $('<div class="card-body"></div>').append(
                        $('<h4 class="text-truncate"></h4>').text(item.filename),
                        $('<hr>'),
                        $('<div class="d-flex justify-content-between"></div>').append(
                            $('<span></span>').text(`${item.value.toFixed(1)}%`),
                            $('<div class="text-truncate"></div>').append(
                                $('<i class="fa-solid fa-hashtag me-1"></i>'),
                                $('<span></span>').text(item.count)
                            )
                        )
                    )
                )
            );
            mainContent.append(card);
        });

        container.append(mainContent);
    });

    row.append(aside).append(container);
    $('#similarity-result').append(row);
    $("#similarity-result").show();

    $('.btn-group-vertical input').click(function() {
        const target = $(this).data('target');
        $('.card-docx-container').addClass('hidden'); // Hide all cards
        $(`.card-docx-container[data-id="${target}"]`).removeClass('hidden'); // Show the selected card
    });

    aside.find('input').first().click(); // Automatically click the first radio button
}

function setupVisualiseForm() {
    $('.card-docx-container .card-body').on('click', function() {
        const $card_docx = $(this).parents('.card-docx-display').first();
        const setBaseFile = setFileInput($card_docx.data("base-file"), "#base_file");
        const setCompareFile = setFileInput($card_docx.data("compare-file"), "#compare_file");

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
    const $similarityResultDiv = $similarityResultAside.next();
    const $contextMenu = $(`#${contextMenuID}`);
    
    const action = isVisible ? 'show' : 'hide';
    const containerClass = isVisible ? "container" : "container-fluid";
    const colClass = isVisible ? "col-10" : "col-12";
    
    $navBar[action]();
    $settingBar[action]();
    $similarityResult.attr("class", containerClass);
    $similarityResultDiv.attr("class", colClass);
    $similarityResultDiv.find(".card-docx-container")
        .toggleClass('pdf', !isVisible)
        .find("> div")
        .toggleClass('pdf disable-hover', !isVisible);
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
        const divId = `#similarity-result [data-id='${selectedInputId}']`;
        $(divId).addClass('hidden');
    });
}

function generateTitlePDF(element) {
    const selectedInputId = $(element).attr('data-target');
    const selectedLabel = $(element).next().text();
    const titleHTML = $(`<div data-result-docx-title="${selectedLabel}" class="h1 text-center mt-3"></div>`).text(selectedLabel);
    const divId = `#similarity-result [data-id='${selectedInputId}']`;
    $(divId).removeClass('hidden');
    $(titleHTML).insertBefore(divId);
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

});

// Context Menu functions
function configureContextMenuButtons(){
    $('#reupload-btn').on('click', () => reuploadFiles() );
    
    $('#pdf-btn').on('click', () => exportSinglePDF() );

    $('#all-pdf-btn').on('click', () => exportAllPDF() );
}

const customFunc = function(e) {
    e.preventDefault();
    const selectedLabel = $('#similarity-result aside input:checked').next().text();
    $('#pdf-btn').html(`<i class="fa-solid fa-file-export"></i> ${selectedLabel} PDF`);
    showContextMenu(e);
};

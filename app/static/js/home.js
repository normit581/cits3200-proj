const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
const maxFiles = 2;
const maxFileSize = 100 * 1024 * 1024; //100MB
const maxTotalSize = maxFiles * maxFileSize;

function openFileList() {
    $("#file-list").css("width", "15%");
    $("#drop-zone").css("width", "85%");
}

function closeFileList() {
    $("#file-list").css("width", "0%");
    $("#drop-zone").css("width", "100%");
}

function handleFileList(change) {
    numFiles += change;
    switch (change) {
        case 1:
            if (numFiles === 1) { openFileList(); }
            break;
        case -1:
            if (numFiles === 0) { closeFileList(); }
            break;
    }
}

function deleteListItem(e) {
    const itemId = e.data.itemId;
    $(`#list-item-${itemId}`).tooltip('dispose');
    $(`#list-item-${itemId}`).remove();
    handleFileList(-1);
    currentFiles.delete(e.data.filename);
    updateFileInput();
    updateProgressBar();
}

function createListItem(name) {
    let delIcon = $('<i>')
        .addClass('bi')
        .addClass('bi-trash3')
        .click({itemId: fileId, filename:fileNameWithoutExt(name)}, deleteListItem)
    
    let para = $('<p>')
        .text(name);
    
    let item = $('<span>')
        .attr('data-bs-toggle', "tooltip")
        .attr('data-bs-title', name)
        .attr('data-bs-placement', "right")
        .tooltip()
        .addClass('d-flex')
        .addClass('justify-content-between')
        .attr('id', `list-item-${fileId}`)
        .append(para)
        .append(delIcon);
    fileId++;
    return item
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
    progressBar.text(`${numFiles}/${maxFiles} DOCX`)

    if (progress === 100) {
        progressBar.addClass('bg-success');
        submitBtn.addClass('bg-success');
    } else {
        progressBar.removeClass('bg-success');
        submitBtn.removeClass('bg-success');
    }
}

function handleFiles(files) {
    const $fileList = $('#file-list');
    
    $.each(files, function(index, file) {
        if (validateFile(file)) {
            if (currentFiles.size >= maxFiles) {
                alert(`Maximum of ${maxFiles} files reached.`);
                return false;
            }
            
            if (updateTotalSize() + file.size > maxTotalSize) {
                alert("Total file size exceeds the maximum of 200MB.");
                return false;
            }

            handleFileList(1);
            currentFiles.set(fileNameWithoutExt(file.name), file);
            const item = createListItem(file.name);
            $fileList.append(item);
            updateFileInput();
            applyConfirmAnimation();
            updateProgressBar();
        }
    });
}

function setFileEvents() {
    const $fileInput = $('#files');
    $fileInput.on('change', function(e) {
        handleFiles(e.target.files);
    });

    const $dropZone = $('#drop-zone');
    $dropZone.on('click', function() {
        $fileInput.click();
    });

    $dropZone.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $dropZone.addClass('dragover');
    });

    $dropZone.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $dropZone.removeClass('dragover');
    });

    $dropZone.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $dropZone.removeClass('dragover');
        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });
}

function updateFileInput() {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => {
        dataTransfer.items.add(file);
    });
    $('#files')[0].files = dataTransfer.files;
}

const onXhrMatch = () => {
    let xhr = new window.XMLHttpRequest();
    xhr.upload.addEventListener("progress", function(evt) {
        if (evt.lengthComputable) {
            let percentComplete = evt.loaded / evt.total * 100;
            $('#upload-progress').css('width', percentComplete + '%').attr('aria-valuenow', percentComplete);
        }
    }, false);
    return xhr;
}

const onErrorMatch = (xhr) => {
    let responseText = "";
    if(xhr.status === 404) {
        responseText = 'The uploaded files are too large. Please try again with smaller files.'
    } else if (xhr.status === 400) {
        responseText = 'Invalid request. Please check your files and try again.';
    }
    GenerateDangerAlertDiv("Failed!",`ErrorCode: ${xhr.status}. ${responseText}`);
};

const onSuccessMatch = (response) => {
    if (response.success) {
        ScrollToTopPage();
        appendMatchResults(response.data);
        setupVisualiseForm();
        // GenerateSuccessAlertDiv("Success!", response.message);
        $("#setting-bar-container").show()
        $("#upload-container").hide()
    } else {
        GenerateDangerAlertDiv("Failed!", response.message);
    }
}

function match() {
    if (!confirm(`Are you sure you want to MATCH documents?`))
        return;

    if (currentFiles.size === 0) {
        GenerateDangerAlertDiv('Failed!', 'Please add at least one file.');
        return;
    }
    $('#similarity-result').empty()
    CallPost(`/home`, validateMatchForm(), onSuccessMatch, onErrorMatch, onXhrMatch);
}

function appendMatchResults(similarityResults){
    let row = $('<div class="row mt-4"></div>');
    let aside = $('<aside class="col-2"><div class="btn-group-vertical col-12 shaded" role="group" aria-label="Vertical radio toggle button group"></div></aside>');
    
    let mainContent = $('<div class="col-10"><div class="row card-docx-container"></div></div>');
    $.each(similarityResults, function(key, values) {
        let keyId = `${key}-${Object.keys(similarityResults).indexOf(key)}`;
        let radioId = `vbtn-radio-${keyId}`;
        let radioInput = $('<input type="radio" class="btn-check">')
            .attr('name', 'vbtn-radio')
            .attr('id', radioId)
            .attr('autocomplete', 'off')
            .attr('data-target', keyId);
        let radioLabel = $('<label class="btn btn-outline-secondary text-truncate mt-0"></label>')
            .attr('for', radioId)
            .text(key);
    
        aside.find('.btn-group-vertical').append(radioInput).append(radioLabel);

        $.each(values, function(i, item) {
            let card = $(`<div class="card-docx-display card col-3 hidden"></div>`)
                .attr({
                    'data-id': keyId,
                    'data-base-file': key,
                    'data-compare-file': item.filename
                });
            card.append(
                $('<div class="card shaded"></div>').append(
                    $('<div class="card-body"></div>').append(
                        $('<h4 class="text-truncate"></h4>').append(
                            $('<span class="text-truncate"></span>').text(item.filename)
                        ),
                        $('<hr>'),
                        $('<div class="d-flex justify-content-between"></div>').append(
                            $('<span></span>').text(item.value.toFixed(1) + '%'),
                            $('<div class="text-truncate"></div>').append(
                                $('<i class="fa-solid fa-hashtag me-1"></i>'),
                                $('<span></span>').text(item.count)
                            )
                        )
                    )
                )
            );
            mainContent.find('.card-docx-container').append(card);
        });
    });
    
    row.append(aside).append(mainContent);
    $('#similarity-result').append(row);
    $("#similarity-result").show();

    $('.btn-group-vertical input').click(function() {
        let target = $(this).data('target');
        $('.card-docx-display[data-id]').addClass('hidden'); // Hide all cards
        $(`.card-docx-display[data-id="${target}"]`).toggleClass('hidden'); // Toggle the clicked card
    });
}

function setupVisualiseForm(){
    $('.card-docx-container > .card').on('click', function() {
        const $card_docx = $(this);
        const setBaseFile = setFileInput($card_docx.data("base-file"), "#base_file")
        const setCompareFile = setFileInput($card_docx.data("compare-file"), "#compare_file")
        if(setBaseFile && setCompareFile){
            $("#visualise-form").submit()
        }
    });
}

function setFileInput(filename, inputID){
    const fileData = currentFiles.get(filename);
    if (!fileData){
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

function reuploadFiles(){
    CloseAlertDiv()
    $('#upload-container').show();
    $("#similarity-result").hide();
    $("#reupload-container").hide();
    $('#setting-bar-container').hide()
    ScrollToTopPage();
}

$(document).ready(function() {
    $(window).on('beforeunload', showRefreshAlert);

    setFileEvents();
    closeFileList();
    $('#match-form').on('submit', function(e) {
        e.preventDefault();
        match();
    });

    $('#setting-bar-container').hide()
});
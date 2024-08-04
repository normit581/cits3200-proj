const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;

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
    $(`#list-item-${e.data.itemId}`).remove();
    handleFileList(-1);
}

function createListItem(name) {
    let delIcon = $('<i>')
        .addClass('bi')
        .addClass('bi-trash3')
        .click({itemId: fileId}, deleteListItem);
    
    let para = $('<p>')
        .text(name);
    
    let item = $('<span>')
        .addClass('d-flex')
        .addClass('justify-content-between')
        .attr('id', `list-item-${fileId}`)
        .append(para)
        .append(delIcon);

    fileId++;
    return item
}

function handleFiles(files) {
    var $fileList = $('#file-list');
    $.each(files, function(index, file) {
        if (file.type === docxExtension) {
            if (numFiles === 2) {
                alert("Maximum of 2 files")
                return;
            }

            handleFileList(1);
            let item = createListItem(file.name);
            $fileList.append(item);
        } else {
            alert('Only .docx files are allowed.');
        }
    });
}

function setFileEvents(){
    let $fileInput = $('#file-input');
    $fileInput.on('change', function(e) {
        handleFiles(e.target.files);
    });

    let $dropZone = $('#drop-zone');
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
        var files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });
}

$(() => {
    setFileEvents();
    closeFileList();
});
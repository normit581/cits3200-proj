const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
const maxFileSize = 100 * 1024 * 1024; //100MB

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

    currentFiles.delete(itemId);
    updateFileInput();
}

function createListItem(name) {
    let delIcon = $('<i>')
        .addClass('bi')
        .addClass('bi-trash3')
        .click({itemId: fileId}, deleteListItem)
    
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

function handleFiles(files) {
    var $fileList = $('#file-list');
    $.each(files, function(index, file) {
        if (file.type === docxExtension) {
            if (file.size > maxFileSize) {
                alert(`File ${file.name} exceeds the maximum size of 100MB.`);
                return;
            }

            if (numFiles === 2) {
                alert("Maximum of 2 files");
                return;
            }

            handleFileList(1);
            currentFiles.set(fileId, file);
            let item = createListItem(file.name);
            $fileList.append(item);
            updateFileInput();
        } else {
            alert('Only .docx files are allowed.');
        }
    });
}

function setFileEvents(){
    let $fileInput = $('#files');
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

function updateFileInput() {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => {
        dataTransfer.items.add(file);
    });
    $('#files')[0].files = dataTransfer.files;
}

$(() => {
    setFileEvents();
    closeFileList();
});
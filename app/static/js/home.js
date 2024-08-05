const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
const maxFileSize = 100 * 1024 * 1024; //100MB
const maxTotalSize = 200 * 1024 * 1024; //200MB (assuming max 2 files)

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
    updateProgressBar();
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

function applyConfirmAnimation() {
    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.add('confirm-animation');
    setTimeout(() => {
        dropZone.classList.remove('confirm-animation');
    }, 500);
}

function validateFile(file) {
    if (file.type !== docxExtension) {
        alert('Only .docx files are allowed.');
        return false;
    }
    if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 100MB.`);
        return false;
    }
    return true;
}

function updateTotalSize() {
    return Array.from(currentFiles.values()).reduce((sum, file) => sum + file.size, 0);
}

function handleFiles(files) {
    const $fileList = $('#file-list');
    
    $.each(files, function(index, file) {
        if (validateFile(file)) {
            if (currentFiles.size >= 2) {
                alert("Maximum of 2 files reached.");
                return false;
            }
            
            if (updateTotalSize() + file.size > maxTotalSize) {
                alert("Total file size exceeds the maximum of 200MB.");
                return false;
            }

            handleFileList(1);
            currentFiles.set(fileId, file);
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

$(document).ready(function() {
    setFileEvents();
    closeFileList();

    $('#match-form').on('submit', function(e) {
    e.preventDefault();
    
    if (currentFiles.size === 0) {
        alert('Please add at least one file.');
        return;
    }

    const formData = new FormData();
    let isValid = true;

    currentFiles.forEach((file, id) => {
        if (validateFile(file)) {
            formData.append('files', file);
        } else {
            isValid = false;
            currentFiles.delete(id);
            $(`#list-item-${id}`).remove();
            handleFileList(-1);
        }
    });

    if (!isValid) {
        
        alert('Some files were removed due to validation errors. Please check and try again.');
        updateProgressBar();
        return;
    }
    formData.append('csrf_token', $('input[name=csrf_token]').val());

    $.ajax({
        url: $(this).attr('action'),
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total * 100;
                    $('#upload-progress').css('width', percentComplete + '%').attr('aria-valuenow', percentComplete);
                }
            }, false);
            return xhr;
        },
        success: function(response) {
            if (response.message) {
                alert(response.message);
                // Do what we need to do here
            } else if (response.error) {
                alert(response.error);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.status === 413) {
                alert('The uploaded files are too large. Please try again with smaller files.');
            } else if (xhr.status === 400) {
                alert('Invalid request. Please check your files and try again.');
            } else {
                alert('An error occurred while uploading the files. Please try again.');
            }
            console.error(xhr.responseText);
        }
    });
});
});
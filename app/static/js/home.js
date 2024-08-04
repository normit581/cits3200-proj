const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;

function openFileList() {
    $("#file-list").css("width", "15%");
    $("#drop-zone").css("width", "85%");
    $("#file-list").prop('hidden', false);
}

function closeFileList() {
    $("#file-list").css("width", "0%");
    $("#drop-zone").css("width", "100%");
    $("#file-list").prop('hidden', true);
}

function handleFileList(change) {
    switch (change) {
        case 1:
            if (numFiles === 0) { openFileList(); }
            break;
        case -1:
            if (numFiles === 1) { closeFileList(); }
            break;
    }
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
            $fileList.append('<p>' + file.name + '</p>');
            numFiles++;
        } else {
            alert('Only .docx files are allowed.');
        }
    });
}

function setFileEvents(){
    var $fileInput = $('#file-input');
    $fileInput.on('change', function(e) {
        handleFiles(e.target.files);
    });

    var $dropZone = $('#drop-zone');
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
});
const validExtensions = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword" // .doc
];


function handleFiles(files) {
    var $fileList = $('#file-list');
    $fileList.empty();
    $.each(files, function(index, file) {
        if (validExtensions.includes(file.type)) {
            $fileList.append('<p>' + file.name + '</p>');
        } else {
            alert('Only Word files (.doc, .docx) are allowed.');
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
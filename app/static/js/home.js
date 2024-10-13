const docxExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
let numFiles = 0;
let fileId = 0;
let currentFiles = new Map();
let isRemindBeforeRefresh = false;
const maxTotalSize = maxFiles * maxFileSize;
const maxTotalSizeDisplayText = humanReadableSize(maxFileSize);
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

    $listItem.tooltip('dispose');
    $listItem.remove();
    currentFiles.delete(filename);
    
    handleFileList(-1);
    updateFileInput();
    updateProgressBar();
}

function createListItem(name) {
    const filename = fileNameWithoutExt(name);
    let createdFilename = filename;
    let warningIcon = '';
    if (currentFiles.has(filename)){
        warningIcon = $('<i>')
            .attr('title', `duplicate file with ${filename}`)
            .addClass('fa-solid fa-triangle-exclamation text-warning mt-1 mx-auto text-center');
        name = `${name}-${fileId}`
        createdFilename = `${filename}-${fileId}`
    }

    const delIcon = $('<i>')
        .addClass('bi bi-trash3')
        .click({ itemId: fileId, filename: createdFilename }, deleteListItem);

    const para = $('<p>').text(name);
    const item = $('<span>')
        .attr({
            'data-bs-toggle': 'tooltip',
            'data-bs-title': name,
            'data-bs-placement': 'right',
            'data-original-file-name': filename,
            'data-file-name': createdFilename,
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
        GenerateDangerAlertDiv("Failed!", `File ${file.name} exceeds the maximum size of ${maxTotalSizeDisplayText}.`);
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
            GenerateDangerAlertDiv('Failed!', `Maximum of ${maxFiles} files reached. Only the first ${maxFiles} will be uploaded.`);
            return false;
        }

        const newTotalSize = updateTotalSize() + file.size;
        if (newTotalSize > maxTotalSize) {
            GenerateDangerAlertDiv('Failed!', `Total file size exceeds the maximum of ${maxTotalSizeDisplayText}.`);
            return false;
        }

        handleFileList(1);
        const originalFileName = file.name;
        const item = createListItem(originalFileName);
        $fileList.append(item);
        const createdFileName = item.attr('data-file-name');
        if (originalFileName !== createdFileName){ // means duplicated file name
            file = new File([file], createdFileName, { type: file.type });
        }
        currentFiles.set(createdFileName, file);

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
        $('aside').css('margin-top', '55px')
        triggerContextMenuEvent($('main'), true);
        overlay.completeProgress();
        isRemindBeforeRefresh = true;
    } else {
        GenerateDangerAlertDiv("Failed!", response.message);
    }
};

function match() {
    CloseAlertDiv();
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
    currentViewIndex = 0;
    const $row = $('<div>', { class: 'row'});
    const $aside = $('<aside>', { class: 'col-2' }).append(
        $('<div>', {
            class: 'btn-group-vertical col-12 shaded',
            role: 'group',
            'aria-label': 'Vertical radio toggle button group'
        })
    );

    const $contentContainer = $('<div>', { class: 'col-10 position-relative' });

    const currentSortMode = sortModes[currentSortIndex];
    const nextSortIndex = (currentSortIndex + 1) % sortModes.length;
    const nextSortMode = sortModes[nextSortIndex];

    const $sortButton = $('<button>', {
        id: 'sort-toggle-btn',
        class: 'position-absolute tool-btn',
        style: 'top: 10px; right: 10px; z-index: 1000; background: transparent; border: none;',
        html: `<i class="fa-solid ${currentSortMode.icon}" style="font-size: 1.5rem; color: #000;"></i>`
    }).attr('title', `Switch to ${nextSortMode.label}`);


    const $reuploadButton = $('<button>', {
        id: 'reupload-btn',
        class: 'position-absolute tool-btn',
        style: 'top: 10px; left: 10px; z-index: 1000; background: transparent; border: none;',
        html: `<i class="fa-solid fa-upload" style="font-size: 1.5rem; color: #000;"></i>`
    }).attr('title', 'Reupload');
    
    const $exportButton = $('<button>', {
        id: 'reupload-btn',
        class: 'position-absolute tool-btn',
        style: 'top: 10px; left: 50px; z-index: 1000; background: transparent; border: none;',
        html: `<i class="fa-solid fa-file-export" style="font-size: 1.5rem; color: #000;"></i>`
    }).attr('title', 'Export PDF');

    const currentViewMode = viewModes[currentViewIndex];
    const nextViewIndex = (currentViewIndex + 1) % viewModes.length;
    const nextViewMode = viewModes[nextViewIndex];

    const $viewButton = $('<button>', {
        id: 'view-toggle-btn',
        class: 'position-absolute tool-btn',
        style: 'top: 10px; right: 50px; z-index: 1000; background: transparent; border: none;',
        html: `<i class="fa-solid ${currentViewMode.icon}" style="font-size: 1.5rem; color: #000;"></i>`
    }).attr('title', currentViewMode.nextTitle);

    const $searchBar = $('<input>', {
        type: 'text',
        id: 'search-bar',
        class: 'form-control tool-btn',
        placeholder: 'Search...',
        style: 'width: 45%; left: 25%; position: absolute; top: 5px; border:  0.1rem solid #343a40'
    });

    function updateSearchFilter(search) {
        const searchTerm = search.toLowerCase();  // Converts input to lowercase
        const minValue = parseFloat($('#matchSlider').val());
        $('#similarity-result .card-docx-display, #similarity-result .card-docx-container-list > div').each(function() {
            const fileName = $(this).data('compare-file').toLowerCase();  // Converts filenames to lowercase
            const matchPercent = parseFloat($(this).data('match-percent'));

            const isVisible = fileName.includes(searchTerm) && matchPercent >= minValue;
            const action = isVisible ? 'removeClass' : 'addClass';
            $(this)[action]('hidden');  // Hides based on filter
        });
    }
    
    $searchBar.on('input', function() {
        const search = $(this).val();
        updateSearchFilter(search);
    });
  

    $contentContainer.append($reuploadButton, $exportButton, $sortButton, $viewButton, $searchBar);
    const $gridContainer = $('<div>', { class: 'hidden', 'data-view-name': 'grid' });
    const $listContainer = $('<div>', { 'data-view-name': 'list' });
    $contentContainer.append($gridContainer).append($listContainer);
    $contentContainer.css('padding-top', '50px');

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
            title: keyId,
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
                    $('<i>', { class: 'fa-solid fa-hashtag me-1' }), matchCount
                ),
                $('<span>', { class: `badge bg-primary me-2 ${badgeColour} fixed-width-badge` }).text(matchPercent === 0 ? '00.0%' : `${matchPercent.toFixed(1)}%`) // Match percentage
            );
            $row.append($fileInfo, $matchInfo);
            $mainContent.append($row);
        });
        $listContainer.append($mainContent);
    });

    $row.append($aside).append($contentContainer);
    $('#similarity-result').append($row);
    $('#similarity-result').show();

    $sortButton.on('click', () => {
        sortResultsView();
        const nextSortMode = sortModes[currentSortIndex];
        $('#sort-toggle-btn').html(`<i class="fa-solid ${nextSortMode.icon}" style="font-size: 1.5rem; color: #000;"></i>`);
    });

    $row.append($aside, $contentContainer);
    $('#similarity-result').append($row).show();

    $reuploadButton.on('click', () => {
        reuploadFiles();
    });

    $viewButton.on('click', () => {
        toggleView();
    });

    $exportButton.on('click', () => {
        exportSinglePDF()
    });

    const $similarityResultView = $('#similarity-result');
    $similarityResultView.find('.btn-group-vertical input').click(function() {
        const target = $(this).data('target');
        $similarityResultView.find('.card-docx-container').addClass('hidden'); // Hide all grid containers
        $similarityResultView.find('.card-docx-container-list').addClass('hidden'); // Hide all list containers
        $similarityResultView.find(`.card-docx-container[data-id="${target}"]`).removeClass('hidden'); // Show the selected grid container
        $similarityResultView.find(`.card-docx-container-list[data-id="${target}"]`).removeClass('hidden'); // Show the selected list container
    });
    $aside.find('input').first().click();
    applySort();
   // sortListView();
   const asideElement = document.querySelector('#similarity-result aside');
   let scrollPosition = 0;
   
   asideElement.addEventListener('scroll', () => {
       scrollPosition = asideElement.scrollTop;
   });
   
   asideElement.querySelectorAll('input[type="radio"]').forEach((radio) => {
       radio.addEventListener('click', () => {
           setTimeout(() => {
               asideElement.scrollTop = scrollPosition;
           }, 0);
       });
   });
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

function reuploadFiles() {
    CloseAlertDiv();
    $('#upload-container').show();
    $("#similarity-result").hide();
    $("#reupload-container").hide();
    $('#setting-bar-container').hide();
    ScrollToTopPage();
    triggerContextMenuEvent($('main'), false);
}

function exportPDF() {
    window.print();
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
    const searchTerm = $('#search-bar').val().toLowerCase();
    $('#matchSlider').val(minValue);
    $('#matchInput').val(minValue);

    $('#similarity-result .card-docx-display, #similarity-result .card-docx-container-list > div').each(function() {
        const matchPercent = parseFloat($(this).data('match-percent'));
        const fileName = $(this).data('compare-file').toLowerCase();

        const isVisible = matchPercent >= minValue && fileName.includes(searchTerm);
        const action = isVisible ? 'removeClass' : 'addClass';
        $(this)[action]('hidden');
    });
};

let viewModes = [
    { viewName: 'list', icon: 'fa-list', label: 'List View', nextTitle: 'Switch to Grid View' },
    { viewName: 'grid', icon: 'fa-grip', label: 'Grid View', nextTitle: 'Switch to List View' }
];
let currentViewIndex = 0;


function toggleView() {
    const currentViewMode = viewModes[currentViewIndex];
    const nextViewIndex = (currentViewIndex + 1) % viewModes.length;
    const nextViewMode = viewModes[nextViewIndex];

    $('#similarity-result div[data-view-name]').addClass('hidden');
    $(`#similarity-result div[data-view-name='${nextViewMode.viewName}']`).removeClass('hidden');

    $('#view-toggle-btn').html(`<i class="fa-solid ${nextViewMode.icon}" style="font-size: 1.5rem; color: #000;"></i>`)
        .attr('title', nextViewMode.nextTitle);
    currentViewIndex = nextViewIndex;
    updateContextMenuViewButtons();
}

function updateContextMenuViewButtons() {
    if (currentViewIndex === 0) {
        $('#list-view-btn').addClass('hidden');
        $('#grid-view-btn').removeClass('hidden');
    } else {
        $('#grid-view-btn').addClass('hidden');
        $('#list-view-btn').removeClass('hidden');
    }
}

let sortModes = [
    { mode: 'matchDesc', label: 'Match % Descending', icon: 'fa-sort-amount-down' },
    { mode: 'matchAsc', label: 'Match % Ascending', icon: 'fa-sort-amount-up' },
    { mode: 'filenameAsc', label: 'Filename A-Z', icon: 'fa-sort-alpha-down' },
    { mode: 'filenameDesc', label: 'Filename Z-A', icon: 'fa-sort-alpha-up' }
];
let currentSortIndex = 0;

function sortResultsView() {
    currentSortIndex = (currentSortIndex + 1) % sortModes.length;
    applySort();
}

function applySort() {
    const currentSortMode = sortModes[currentSortIndex];
    const nextSortIndex = (currentSortIndex + 1) % sortModes.length;
    const nextSortMode = sortModes[nextSortIndex];
    
    // List
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
    
    // Grid
    $('#similarity-result .card-docx-container').each(function() {
        const $container = $(this);
        const $items = $container.children('.card-docx-display').get();
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

    $('#sort-btn').html(`<i class="fa-solid ${currentSortMode.icon}"></i> ${currentSortMode.label}`)
        .attr('title', `Switch to ${nextSortMode.label}`);
    $('#sort-toggle-btn').html(`<i class="fa-solid ${currentSortMode.icon}" style="font-size: 1.5rem; color: #000;"></i>`)
        .attr('title', `Switch to ${nextSortMode.label}`);
}

$(document).ready(function() {
    $(window).on('beforeunload', function (event) {
        if (!isRemindBeforeRefresh)
            return; // unload without prompting
        const confirmationMessage = "Changes you made may not be saved.";;
        event.returnValue = confirmationMessage; // most browsers use this
        return confirmationMessage; // older browsers
    });

    configureContextMenuButtons();
    setFileEvents();
    toggleFileList(false);
    $('#sort-toggle-btn').html(`<i class="fa-solid ${sortModes[currentSortIndex].icon}"></i>`);

    $('#match-form').on('submit', function(e) {
        e.preventDefault();
        match();
    });

    $('#setting-bar-container').hide()
});

// Context Menu functions
function configureContextMenuButtons() {
    $('#reupload-btn').on('click', () => reuploadFiles());

    $('#grid-view-btn').on('click', function() {
        toggleView();
    });
    $('#list-view-btn').on('click', function() {
        toggleView();
    });

    updateContextMenuViewButtons();

    $('#sort-btn').on('click', () => sortResultsView());
    
    const currentSortMode = sortModes[currentSortIndex];
    const nextSortIndex = (currentSortIndex + 1) % sortModes.length;
    const nextSortMode = sortModes[nextSortIndex];
    $('#sort-btn').html(`<i class="fa-solid ${currentSortMode.icon}"></i> ${currentSortMode.label}`)
        .attr('title', `Switch to ${nextSortMode.label}`);

    $('#pdf-btn').on('click', () => exportSinglePDF());
    $('#all-pdf-btn').on('click', () => exportAllPDF());

    $('#custom-context-menu .input-group')
        .on('mouseenter', function() { $(this).find('button').addClass('active'); })
        .on('mouseleave', function() { $(this).find('button').removeClass('active'); });

    $('#matchSlider').on('input', (e) => updateFilter(e.target.value));
    $('#matchInput').on('input', (e) => updateFilter(e.target.value));
}

function updateContextMenuViewButtons() {
    if (currentViewIndex === 0) {
        $('#grid-view-btn').addClass('hidden');
        $('#list-view-btn').removeClass('hidden');
    } else {
        $('#list-view-btn').addClass('hidden');
        $('#grid-view-btn').removeClass('hidden');
    }
}

const customFunc = function(e) {
    e.preventDefault();
    const selectedLabel = $('#similarity-result aside input:checked').next().text();
    $('#pdf-btn').html(`<i class="fa-solid fa-file-export"></i> ${selectedLabel} PDF`);
    showContextMenu(e);
};



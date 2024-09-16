function showContextMenu(e){
    const $contextMenu = $(`#${contextMenuID}`);
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const contextMenuHeight = $contextMenu.outerHeight();
    const contextMenuWidth = $contextMenu.outerWidth();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    const availableSpaceBelow = windowHeight - (mouseY - window.scrollY);
    const availableSpaceRight = windowWidth - mouseX;

    let topPosition = mouseY;
    if (availableSpaceBelow < contextMenuHeight) {
        topPosition = mouseY - contextMenuHeight;
    }

    let leftPosition = mouseX;
    if (availableSpaceRight < contextMenuWidth) {
        leftPosition = mouseX - contextMenuWidth;
    }

    $contextMenu
        .css({ top: `${topPosition}px`, left: `${leftPosition}px` })
        .show();
}

function triggerContextMenuEvent($target, isShow){
    $(`#${contextMenuID}`).hide();
    const action = isShow ? 'bind' : 'unbind';
    $target[action]('contextmenu', customFunc);
}

$(document).ready(function() {
    $(`#${contextMenuID}`).hide();

    $(document).on('click', function(e) {
        if (!$(e.target).closest(`#${contextMenuID}`).length) {
            $(`#${contextMenuID}`).hide();
        }
    });
});
function setLogo() {
    $(".my-logo").replaceWith(
        `<span class="fa-stack fa-xl">
            <i class="fa-brands fa-searchengin fa-stack-1x fa-beat-fade" style="--fa-animation-duration: 2s; --fa-beat-fade-opacity: 0.5; --fa-beat-fade-scale: 1.1;"></i>
            <i class="fa-regular fa-file fa-stack-2x"></i>
            <span class="fa-layers fa-2x">
                <span class="logo-word pos-up">Docu</span>
                <span class="logo-word pos-down">Matcher</span>
            </span>
        </span>`
    );
}

function CallPost(url, data, callbackSuccess, callbackError, callbackXhr) {
    window.$.ajax({
      url: url,
      type: "POST",
      processData: false,
      contentType: false,
      data: data,
      xhr: callbackXhr,
      success: callbackSuccess,
      error: function (xhr, status, error) {
        callbackError?.(xhr, status, error);
      },
    });
}

const OnAjaxError = (xhr) => {
    var response;
    try {
      if (xhr.status && xhr.status === 404) {
        GenerateDangerAlertDiv("Failed!",`ErrorCode: ${xhr.status}. The requested page cannot be found.`);
        return;
      }
  
      response = JSON.parse(xhr.responseText);
  
      if (response) {
        GenerateDangerAlertDiv("Failed!", response.message);
      }
    } catch (e) {
      GenerateDangerAlertDiv("Failed!", xhr.responseText);
    }
};

function GenerateSuccessAlertDiv(title, message, divId) {
    if (!divId) {
        divId = "#AlertModalDiv";
    }

    window
        .$(divId)
        .removeClass()
        .addClass("alert alert-success alert-dismissible");
    window.$(divId)
        .html(`<button type="button" class="close" onclick="CloseAlertDiv('${divId}')">&times;</button>\n
                <h4><i class="icon fa fa-check me-2"></i>${title}</h4>\n
                <span id="AlertMessage">${message}</span>`);
    ScrollToTopPage();
}

function GenerateDangerAlertDiv(title, message, divId) {
    if (!divId) {
        divId = "#AlertModalDiv";
    }

    window
        .$(divId)
        .removeClass()
        .addClass("alert alert-danger alert-dismissible");
    window.$(divId)
        .html(`<button type="button" class="close" onclick="CloseAlertDiv('${divId}')">&times;</button>\n
                <h4><i class="icon fa fa-ban me-2"></i>${title}</h4>\n
                <span id="AlertMessage">${message}</span>`);
    ScrollToTopPage();
}

function CloseAlertDiv(divId) {
    if (!divId) {
        divId = "#AlertModalDiv";
    }

    window.$(divId).addClass("d-none");
}

function ScrollToTopPage() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}

$(() => {
    setLogo();
});
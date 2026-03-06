var progress = 0;
var progressBar = document.getElementById('progress');
var loadingContainer = document.getElementById('loadingContent');
var percentageText = document.getElementById('percentage')

var interval = setInterval(function() {

    progress += 1;
    progressBar.style.width = progress + '%';

    percentageText.innerHTML = progress + '%'

    if (progress >= 100) {
        clearInterval(interval);

        loadingContent.classList.add('hide');

        setTimeout(function () {
            loadingContent.style.display = "none";
        }, 1000);
    }
}, 30);
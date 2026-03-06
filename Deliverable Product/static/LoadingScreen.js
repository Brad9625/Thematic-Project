var progress = 0;
var progressBar = document.getElementById('progress');
var loadingContainer = document.getElementById('loadingContainer');
var percentageText = document.getElementById('percentage')
var mainContainer = document.getElementById('main-containers')

mainContainer.style.opacity = "0";

var interval = setInterval(function() {

    progress += 1;
    progressBar.style.width = progress + '%';

    percentageText.innerHTML = progress + '%'

    if (progress >= 100) {
        clearInterval(interval);

        loadingContainer.classList.add('hide');

        setTimeout(function () {
            loadingContainer.style.display = "none";
            mainContainer.style.opacity = "1";

        }, 1000);
    }
}, 30);
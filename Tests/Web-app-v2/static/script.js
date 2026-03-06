document.addEventListener("DOMContentLoaded", function() {
    const dmButton = document.getElementById("darkModeBtn");

    // check for theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    if (dmButton) {
        dmButton.addEventListener("click", function() {
            document.body.classList.toggle("dark");




            // save
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }
        });
    }
});
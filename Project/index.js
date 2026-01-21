    const rulesBtn = document.getElementById("rulesBtn");
    const modal = document.getElementById("rulesModal");
    const closeBtn = document.getElementById("rulesCloseBtn");

    function openRules() {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeRules() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }

    rulesBtn.addEventListener("click", openRules);
    closeBtn.addEventListener("click", closeRules);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeRules();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeRules();
    });
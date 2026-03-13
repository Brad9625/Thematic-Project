const input = document.getElementById("text");
const generateBtn = document.getElementById("generateBtn");
const qrContainer = document.getElementById("qrcode");


let qr = new QRCode(qrContainer, {
  text: "",
  width: 200,
  height: 200,
  correctLevel: QRCode.CorrectLevel.H
});


function generateQR() {
  const value = input.value.trim();

  if (!value) {
    showError("Please enter some text or a URL.");
    return;
  }

  qrContainer.innerHTML = "";


  qr = new QRCode(qrContainer, {
    text: value,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.H
  });

  animateQR();
}

function animateQR() {
  qrContainer.style.opacity = 0;
  setTimeout(() => {
    qrContainer.style.opacity = 1;
  }, 50);
}

function showError(message) {
  alert(message);
}

generateBtn.addEventListener("click", generateQR);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateQR();
});
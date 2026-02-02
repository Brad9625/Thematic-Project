const map = L.map("map").setView([53.8008, -1.5491], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// BUS
const busIcon = L.icon({
  iconUrl: "Bus.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});


let busMarker = L.marker([53.8008, -1.5491], { icon: busIcon }).addTo(map);

const busRoute = [
  [53.8008, -1.5491],
  [53.8020, -1.5450],
  [53.8030, -1.5400],
  [53.8010, -1.5500]
];

let busIndex = 0;

function moveBus() {
  busMarker.setLatLng(busRoute[busIndex]);
  busIndex = (busIndex + 1) % busRoute.length;
  setTimeout(moveBus, 1000);
}

moveBus();

// TRAIN
const trainIcon = L.icon({
  iconUrl: "Train.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});


let trainMarker = L.marker([53.7940, -1.5480], { icon: trainIcon }).addTo(map);

const trainRoute = [
  [53.7940, -1.5480],
  [53.7955, -1.5550],
  [53.7970, -1.5600],
  [53.7940, -1.5480]

];

let trainIndex = 0;

function moveTrain() {
  trainMarker.setLatLng(trainRoute[trainIndex]);
  trainIndex = (trainIndex + 1) % trainRoute.length;
  setTimeout(moveTrain, 1000);
}

moveTrain();

// BOAT
const boatIcon = L.icon({
  iconUrl: "Boat.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});


let boatMarker = L.marker([53.7890, -1.5320], { icon: boatIcon }).addTo(map);

const boatRoute = [
  [53.7890, -1.5320],
  [53.7900, -1.5350],
  [53.7910, -1.5380],
  [53.7890, -1.5320]
];

let boatIndex = 0;

function moveBoat() {
  boatMarker.setLatLng(boatRoute[boatIndex]);
  boatIndex = (boatIndex + 1) % boatRoute.length;
  setTimeout(moveBoat, 1000);
}

moveBoat();

// TAXI
const taxiIcon = L.icon({
  iconUrl: "Taxi.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});

let taxiMarker = L.marker([53.8030, -1.5400], { icon: taxiIcon }).addTo(map);

const taxiRoute = [
  [53.8030, -1.5400],
  [53.8050, -1.5350],
  [53.8070, -1.5300],
  [53.8030, -1.5400]
];

let taxiIndex = 0;

function moveTaxi() {
  taxiMarker.setLatLng(taxiRoute[taxiIndex]);
  taxiIndex = (taxiIndex + 1) % taxiRoute.length;
  setTimeout(moveTaxi, 1000);
}

moveTaxi();
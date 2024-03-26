

const DISTO_SERVICEID = '3ab10100-f831-4395-b29d-570977d5bf94';
const DISTO_DISTANCE = "3ab10101-f831-4395-b29d-570977d5bf94";
const DISTO_DISTANCE_UNIT = "3ab10102-f831-4395-b29d-570977d5bf94";
const DISTO_COMMAND = "3ab10109-f831-4395-b29d-570977d5bf94";
const STATE_RESPONSE = "3ab1010a-f831-4395-b29d-570977d5bf94";
const DS_MODEL_NAME = "3ab1010c-f831-4395-b29d-570977d5bf94";
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const DEVICE_INFORMATION = '0000180a-0000-1000-8000-00805f9b34fb';

const namePrefix = "DISTO ";
let service;
let device;

// Attach event listener to the button
const discoverButton = document.getElementById('discoverButton');
discoverButton.addEventListener('click', discoverDevices);

const disconnectButton = document.getElementById('disconnectButton');
disconnectButton.addEventListener('click', disconnectFromDevice);


async function discoverDevices() {
    console.log("discoverDevices");
    let filters = [];

    // filter on EITHER namePrefix OR services
    filters.push({
        namePrefix: namePrefix
    });
    //filters.push({
    //    services: [DISTO_SERVICEID]
    //});

    let options = {
        optionalServices: [DEVICE_INFORMATION, BATTERY_SERVICE, DISTO_SERVICEID],
        acceptAllDevices: false
    }
    options.filters = filters;

    device = await navigator.bluetooth.requestDevice(options);

    console.log('> Name:' + device.name);
    console.log('> Id:' + device.id);
    console.log(device);
    try {
        await connectToDevice(device);
        console.log('Notifications have been started.');
        document.getElementById("Loading").style.display = "none"
        document.getElementById("disconnect").style.display = "none"
        document.getElementById("Distance_label").style.display = "block"
        
    }

    catch (e) {

    }

}

async function connectToDevice(device) {

    device.addEventListener('gattserverdisconnected', onDisconnected);
    document.getElementById("disconnect").style.display = "none"
    document.getElementById("Loading").style.display = "block"

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    console.log('Getting Service...');

    const service = await server.getPrimaryService(DISTO_SERVICEID);
    console.log(service);



    console.log('Getting Distance Characteristic...');
    const characteristic = await service.getCharacteristic(DISTO_DISTANCE);
    characteristic.addEventListener('characteristicvaluechanged', handleDistanceChanged);

    console.log('Enabling notifications...');
    await characteristic.startNotifications();


    console.log('Connected to ' + device.name);

}


function onDisconnected(event) {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    document.getElementById("result").innerHTML=""
    document.getElementById("disconnect").style.display="block"
    document.getElementById("Loading").style.display = "none"
    document.getElementById("Distance_label").style.display = "none"
   
}

function handleDistanceChanged(event) {
    const value = event.target.value;
    console.log('Got distance: ' + value.getFloat32(0, true));

    document.getElementById("result").innerHTML = "Distance = " + value.getFloat32(0, true).toFixed(4) + " m";
}

function disconnectFromDevice() {
    if (device && device.gatt.connected) {
        device.gatt.disconnect();
    }
}

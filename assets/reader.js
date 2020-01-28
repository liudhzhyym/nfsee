class NativeCaller {
  constructor() {
    this.communicator = window.native || webkit.messageHandlers.native;
  }

  postMessage(action, data) {
    const jsonString = JSON.stringify({
      action: action,
      data: data || {}
    });

    this.communicator.postMessage(jsonString);
  }
}

const nativeCaller = new NativeCaller();

let pendingPromise = null;

const callNativeAndSetPendingPromise = (message, data) => {
  const ret = new Promise((resolve, reject) => {
    pendingPromise = [resolve, reject];
  });

  nativeCaller.postMessage(message, data);
  return ret;
}

const returnDataToPendingPromise = (data) => {
  if (pendingPromise) {
    pendingPromise[0](data);
    pendingPromise = null;
  }
};

const rejectPendingPromise = () => {
  if (pendingPromise) {
    pendingPromise[1]();
    pendingPromise = null;
  }
};

const poll = () => callNativeAndSetPendingPromise('poll');

const pollCallback = returnDataToPendingPromise;

const transceive = (rapdu) => callNativeAndSetPendingPromise('transceive', rapdu);

const transceiveCallback = returnDataToPendingPromise;

const transceiveErrorCallback = rejectPendingPromise;

function report(data) {
  nativeCaller.postMessage('report', data);
}

function log(data) {
  nativeCaller.postMessage('log', data);
}

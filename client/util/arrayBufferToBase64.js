const arrayBufferToBase64 = arrayBuffer => btoa(
  new Uint8Array(arrayBuffer)
    .reduce((data, byte) => data + String.fromCharCode(byte), '')
);

export default arrayBufferToBase64;
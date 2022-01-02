export function validateMAC(mac: string) {
  return new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).test(mac);
}

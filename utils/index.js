/** Convert an address into a short address with only the first 7 + last 7 characters */
export function shortAddress(address, number = 5) {
  if(!address) {
    return "-";
  }

  const firstChars = address.substring(0, number);
  const lastChars = address.substr(address.length - number);
  return firstChars.concat('-', lastChars);
}

/** Wait for x ms in an async function */
export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/** Returns current timestamp */
export function getTimestamp() {
  const cur_timestamp = Math.round(new Date().getTime() / 1000).toString()
  return cur_timestamp;
}

/** Will turn IPFS data into a readable URL */
export function getIpfsLink(media) {
  let _url = media.url;
  if(media.gateway) {
    _url = _url.replace("ipfs://", media.gateway)
  } else {
    _url = _url.replace("ipfs://", "https://orbis.mypinata.cloud/ipfs/")
  }

  /** Revert old Adam's image */
  if(_url == "https://ipfsgateway.orbis.club/ipfs/QmW6o4Phn7wJ3TLX8pqgqGQVUTDoauCF1DozXPM9HDQVZ8") {
    _url = "https://orbis.mypinata.cloud/ipfs/Qmd5tZUHAKUpWFtGj7HnTXWVdKGVXxzSxmLBXEq3eXhMT1";
  }

  return _url;
}

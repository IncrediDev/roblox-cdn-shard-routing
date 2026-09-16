function getCDNUrl(MD5Hash) {
  let i = 31; // seed must be 31, not 0
  for (let t = 0; t < MD5Hash.length; t++) {
    i ^= MD5Hash.charCodeAt(t);
  }
  return `https://t${i % 8}.rbxcdn.com/${MD5Hash}`;
}

const cdnMD5Hash = "180DAY-1a54662866d4e9a6db4d2105aa13579e";
console.log(`CDN URL: ${getCDNUrl(cdnMD5Hash)}`);

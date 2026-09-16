# Retrieve Roblox Catalog 3D Asset

I spent an evening working on this for a Chrome Extension, if i made any mistakes you can make a pull request! 😎
This was all written by hand so expect spelling mistakes.

## Request Flow

1. Get the initial asset information from the 3D thumbnail endpoint
2. Get the asset metadata from the returned image URL
3. Calculate the CDN URL for each asset file and download the files

<hr>

## 1. Initial Request for the information <small>or something</small>

Replace `{assetID}` with the Roblox asset ID & Replace `{cookieHere}` with the users `.ROBLOSECURITY` Cookie.

```bash
curl "https://thumbnails.roblox.com/v1/assets-thumbnail-3d?assetId={assetID}" \
  -H "Cookie: .ROBLOSECURITY={cookieHere}"
```

<br>

**Repsonse JSON:**

```json
{
    "targetId": {assetID},
    "state": "Completed",
    "imageUrl": "https://{cdn_Instance}.rbxcdn.com/180DAY-{MD5_Hash}",
    "version": "TN3"
}

```

> ⚠️ **Warning:** Make sure to use Cookie in header! <small>(Otherwise you will get 403: "Invalid authentication data provided") </small>

<hr>

## 2. Get the Metadata of the stuff in the Asset

Replace `{t2-CDN-Url}` with the `"imageUrl"` from the previous Response.

```bash
curl "{t2-CDN-Url}"
```

> 📝 **Note:** You don't need cookie header like previous request, all requests from now require no Authorisation!

<br>

**Repsonse JSON:**

```json
{
  //...
  // We only need the stuff here, all other stuff in the JSON isnt important
  "mtl": "180DAY-{MD5_Hash}",
  "obj": "180DAY-{MD5_Hash}",
  "textures": ["180DAY-{MD5_Hash}", "180DAY-{MD5_Hash}", "180DAY-{MD5_Hash}"]
}
```

> &nbsp;
> 📝 **Note:** heres the full raw json if you care :
>
> ```json
> {
>   "camera": {
>     "position": { "x": -169.714, "y": 13.7342, "z": 213.389 },
>     "direction": { "x": -0.42169, "y": 0.385906, "z": -0.82052 },
>     "fov": 16.534
>   },
>   "aabb": {
>     "min": { "x": -166.879, "y": 10.0, "z": 219.576 },
>     "max": { "x": -165.121, "y": 10.6712, "z": 221.655 }
>   },
>   "mtl": "180DAY-{MD5_Hash}",
>   "obj": "180DAY-{MD5_Hash}",
>   "textures": ["180DAY-{MD5_Hash}", "180DAY-{MD5_Hash}", "180DAY-{MD5_Hash}"]
> }
> ```
>
> im bad at markdown format <small>sorry 🥺</small>
> &nbsp;

<hr>

## 3. Downloading the files!!

Follow each of the instructions for the different file types.

### You need to find the CDN for each of the points based on the `{180DAY-{MD5_HASH}}`

```js
function getCDNUrl(MD5Hash) {
  let i = 31; // seed must be 31, not 0
  for (let t = 0; t < MD5Hash.length; t++) {
    i ^= MD5Hash.charCodeAt(t);
  }
  return `https://t${i % 8}.rbxcdn.com/${MD5Hash}`;
}

const cdnMD5Hash = "180DAY-{MD5_HASH}";
console.log(`CDN URL: ${getCDNUrl(cdnMD5Hash)}`);

//Example : Enter 180DAY-1a54662866d4e9a6db4d2105aa13579e and you get the full CDN link
// This using XOR Calculations
// https://t3.rbxcdn.com/180DAY-1a54662866d4e9a6db4d2105aa13579e
```

<br>

### Downloading the file after getting the URL

Replace `{cdnUrl}` with the `cdnUrl` you got from the XOR Algorithm

```bash
curl "{cdnUrl}"
```

> &nbsp;
> 📝 **Example:**
>
> ```bash
> curl "https://t3.rbxcdn.com/180DAY-1a54662866d4e9a6db4d2105aa13579e"
> ```
>
> &nbsp;

<hr>

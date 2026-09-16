# Reverse-Engineering Roblox's CDN Shard Selection

A short writeup on how I figured out the routing function Roblox uses to distribute assets across its 8 CDN subdomains (`t0.rbxcdn.com` through `t7.rbxcdn.com`).

## Background

Roblox's public asset CDN is fronted by 8 subdomains: `t0` through `t7`. Every asset lives at exactly one of them. The subdomain isn't random and it isn't stored in a lookup table; it's derived deterministically from the asset's hash so any client can compute the correct URL on its own without an extra round-trip lookup.

I wanted to know the derivation.

## The observation

When Roblox serves a 3D thumbnail, the response contains a URL of the form:

```
https://tN.rbxcdn.com/180DAY-{md5_hash}
```

Where `N` is 0 through 7 and the hash is stable per asset. Same asset, same `N`. Different assets, different `N`.

The question: given a hash, what determines `N`?

## The hypothesis

Any content-addressed CDN with N shards needs a way to pick a shard from an identifier without a central registry. The standard technique is a cheap deterministic function of the identifier, mod N. So the shape of the answer is almost certainly:

```
N = f(hash) mod 8
```

The interesting question is what `f` looks like.

## Verification

I collected pairs of `(hash, actualShardNumber)` by observing thumbnail responses. With enough pairs, I could test candidate `f` functions:

- Sum of char codes, mod 8 → no
- Length, mod 8 → no
- First byte of hash, mod 8 → no
- XOR of all char codes, mod 8 → close, but off by a constant
- XOR of all char codes with a seed, mod 8 → **match**

The seed turned out to be `31`. Once I confirmed the algorithm on 100+ observations, I stopped.

## The algorithm

```js
function getCdnShardUrl(hash) {
  let acc = 31; // seed
  for (let i = 0; i < hash.length; i++) {
    acc ^= hash.charCodeAt(i);
  }
  const shard = acc % 8;
  return `https://t${shard}.rbxcdn.com/${hash}`;
}

// Example:
// hash = "180DAY-1a54662866d4e9a6db4d2105aa13579e"
// -> https://t3.rbxcdn.com/180DAY-1a54662866d4e9a6db4d2105aa13579e
```

See `xor.js` for a runnable reference implementation.

## Why this design?

Load balancing at scale. If Roblox stored the shard number server-side, every client would need to hit that lookup before every CDN request, adding an extra round trip for every asset. Deriving it deterministically from the hash means clients compute the URL locally and hit the correct CDN edge directly.

The choice of XOR + seed (rather than a real hash like MD5 mod 8) is because the function has to run in browsers a large number of times per second at essentially zero cost. XOR-reduce over a string of characters is about as cheap as a hash function gets.

## What this is (and isn't)

This is an exercise in observing a pattern in a public URL scheme and deriving the small function that produces it. Nothing here is decryption or authentication bypass. The 8-shard routing is a load-balancing detail, not a security mechanism, and the hashes themselves appear in every public thumbnail response.

## About this repo

- `README.md` — the analysis you're reading
- `xor.js` — reference implementation of the derived function

## License

MIT

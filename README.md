# My Portfolio

View it at [jaynewey.github.io](https://jaynewey.github.io).


## Development

Download the [Tailwind standalone CLI](https://tailwindcss.com/blog/standalone-cli) and add it to your PATH, e.g:

```sh
curl -sL https://github.com/tailwindlabs/tailwindcss/releases/download/v4.1.18/tailwindcss-linux-x64 -o tailwindcss
chmod +x tailwindcss
mv tailwindcss /usr/local/bin/
```

Build and serve the app: (This will require `trunk`: `cargo install trunk`)

```sh
trunk serve
```

The app should now be visible at `127.0.0.1:8080`.


### Formatting and Linting

`rustfmt`, [`leptosfmt`](https://github.com/bram209/leptosfmt) and [`rustywind`](https://github.com/avencera/rustywind) are used to format source files:

```sh
cargo fmt
leptosfmt src
rustywind src
```

`clippy` lints:

```sh
cargo clippy
```

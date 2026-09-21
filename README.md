# tmx

tmx watches your filesystem and excludes selected files (such as `node_modules` and `target`) from Time Machine backups. You can also run a full scan from the app.

## Original project

This project is a continuation of [TimeMachine Exclude (tmexclude)](https://github.com/PhotonQuantum/tmexclude) by [LightQuantum](https://github.com/PhotonQuantum). The original source is licensed under the [MIT License](LICENSE.txt), and its commit history and copyright notices are retained.

## Installation

Download a release from this repository's [Releases](../../releases) page, or build locally on macOS:

```sh
pnpm install --frozen-lockfile
pnpm tauri build
```

For development, run `pnpm tauri dev`. Rust and the macOS development tools are required.

The frontend uses Vue 3 with `<script setup>`, Vite, Pinia, and UnoCSS (Wind 4 / Tailwind 4 compatible preset).

## Configuration

You can configure tmx in the GUI or edit `~/.config/tmexclude.yaml`. This legacy filename is retained so existing rules load after upgrading. Restart the app after manual edits. See [config.example.yaml](config.example.yaml) for an example.

## Screenshots

![Overview](doc/screenshot1.jpeg)
![Scan](doc/screenshot2.jpeg)

## License

[MIT](LICENSE.txt)

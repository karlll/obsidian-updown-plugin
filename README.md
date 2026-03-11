# obsidian-updown-plugin

An [Obsidian](https://obsidian.md) plugin that opens the current note as a live slideshow in the browser, powered by [updown](https://github.com/karlll/updown).

## Prerequisites

Download the `updown` binary from the [updown releases page](https://github.com/karlll/updown/releases) and place it somewhere on your filesystem (e.g. `/usr/local/bin/updown`).

For PlantUML diagram support, you also need a local [plantuml.jar](https://plantuml.com/download).

## Installation

1. Copy the plugin folder into your vault's `.obsidian/plugins/` directory.
2. Enable the plugin in **Settings → Community plugins**.

## Configuration

Open **Settings → updown** and set:

| Setting | Description |
|---|---|
| **updown executable path** | Absolute path to the `updown` binary (e.g. `/usr/local/bin/updown`) |
| **PlantUML JAR path** | Optional: absolute path to `plantuml.jar` for PlantUML diagram support |

## Usage

Open a markdown note and run one of the following commands from the Command Palette (`Cmd/Ctrl+P`):

| Command | Description |
|---|---|
| **updown: Start slideshow** | Starts the updown server for the active note and opens it in the browser |
| **updown: Stop slideshow** | Stops the running updown server |
| **updown: Reload slideshow** | Restarts the server with the current state of the active note |

The slideshow opens automatically in your default browser. Navigate slides with **ArrowLeft** / **ArrowRight**.

## Note format

Notes are standard markdown files. Slides are separated by `#`/`##` headings or `---` horizontal rules.

See [FORMAT.md](https://github.com/karlll/updown/blob/main/FORMAT.md) in the updown repository for the full format reference, covering front matter, meta-fences, multi-column layouts, code blocks, and diagrams.

## Troubleshooting

### macOS: "updown is damaged and can't be opened"

macOS Gatekeeper may quarantine the downloaded `updown` binary and display the message:

> *"updown is damaged and can't be opened. You should move it to the Trash."*

To fix this, remove the quarantine attribute by running the following command in the directory where you placed the binary:

```sh
xattr -d com.apple.quarantine ./updown
```

After running this command you should be able to start the slideshow normally.

## More information

See the [updown project](https://github.com/karlll/updown) for the full feature list, available themes, and diagram support.

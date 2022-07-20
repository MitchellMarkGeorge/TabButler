# Tab Butler

[![Discord](https://img.shields.io/discord/996098605364543529?color=7389D8&label=Join%20Chat&logo=discord&logoColor=7389D8&style=for-the-badge)](https://discord.gg/vf8mfTTNN3)

![Tab Butler Promo Image](src/assets/Tab%20Butler%20Large%20Promo%20Image.png)

## Instructions

<details>
<summary>Development Quick Start</summary>

### Prerequisites

- Node.js (tested on v18)
- NPM (tested on v8.6.0)
- Chrome (>= v88), has only been tested here

Note: Even thought the extension uses the `webextension-pollyfill` library, it has currently only been tested on Chrome. However, it should work on other browsers like Firefox, Opera, Edge, etc.

### Clone Repo

```bash
git clone https://github.com/MitchellMarkGeorge/TabButler
```

### Install Dependencies

```bash
npm install
```

### Start Dev Build

If you are developing for Chrome/Chromeium browsers, use 
```bash
npm run start:chrome
```

If you are developing for Firefox, use 
```bash
npm run start:firefox
```

If you are developing for both Chrome and Firefox, use
```bash
npm run start:all
```

Note: For minified production build, use respective `npm run build` instead.

### Add To Chrome/Chromeium Browsers

- Open `chrome://extensions`
- Enable Development mode
- Click Load Unpacked button
- Navigate to repository
- Select `dist/chrome` directory

### Add To Firefox

- Open `about:debugging`
- Click the `This Firefox` options 
- Click the `Load Temporary Add-on` button
- Navigate to repository
- Select the `manifest.json` file in the `dist/firefox` directory

</details>
<details>
<summary>
Usage
</summary>

| Shortcut                   | Description                        |
| -------------------------- | ---------------------------------- |
| `ctrl` + `shift` + `space` | Toggle tab search in current page  |
| `alt` + `shift` + `space`  | Toggle tab actions in current page |

Note: For Mac, `cmd` is used instead of `ctrl` and `option` is used insead of `alt`.
On Windows and Linux, the Tab Actions modal is toggled with `alt` + `shift` + `K`

</details>

## Built With

- TypeScript (both content and background script)
- [Web Extensions Polyfill](https://github.com/mozilla/webextension-polyfill) (makes the extension cross-platform)
- React (for the actual search modal in content script)
- CSS (for some minor styling in content script)

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Mitchell Mark-George** - _Initial work_
- **Dylan Player** - _Readme development and documentation_

See also the list of [contributors](https://github.com/MitchellMarkGeorge/TabButler/contributors) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details

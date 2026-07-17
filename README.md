# SiClink 三版本整合官网

基于 Next.js 的 SiClink 官网演示版本，整合了三套背景视觉方案：

- 纯黑
- 弥散光
- 星空

页面右下角的胶囊按钮可实时切换三种视觉版本。

## Structure

- `src/app`: website entry, global layout and styles.
- `src/components`: shared UI such as header, side navigation, background, cursor and button.
- `src/sections`: the six page sections: Hero, Vision, Core, Reconstruction, Open Source and Community.
- `src/animations`: GSAP ScrollTrigger helpers.
- `src/data`: Chinese and English content.
- `src/utils`: language detection and persistence.
- `public/images`: visual assets used by the website.

## Development

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

## Build

```bash
npm run build
npm run start
```

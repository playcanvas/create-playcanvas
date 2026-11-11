## VTuber Studio

A Japanese-language avatar demo with a procedural character, pointer reactions, local speech
synthesis, optional browser speech recognition, camera preview with experimental face-position
tracking, avatar file loading, material presets, a chat panel and optional browser notifications.

Create a project with:

```bash
npm create playcanvas@latest my-vtuber -- --starter vtuber-studio
```

### Run

```bash
npm install
npm run dev
```

Click or tap the avatar to make it react. The built-in character animates without external assets.
Use the avatar file picker to load a `.glb` or `.vrm` file. PlayCanvas loads the glTF scene and
materials; VRM-specific extensions and uploaded animation clips are not interpreted by this
starter, so use a VRM exported as a compatible glTF/GLB and expect to configure its animation
separately.

### Browser features and limits

- Camera and microphone start only after the corresponding button is pressed. Camera tracking
  requires HTTPS (or localhost) and the experimental `FaceDetector` browser API. When available,
  it estimates face position and distance to shift the camera; it is not calibrated six-degree-of-
  freedom tracking. Unsupported browsers still show an explicit status and may show the camera
  preview when permission is granted.
- Speech recognition depends on browser support and may use a browser vendor's online service.
  Speech synthesis uses voices installed by the operating system/browser.
- Chat works offline with short local demo replies. An OpenAI-compatible Chat Completions URL and
  model can be configured in the panel to connect a lightweight local or hosted LLM. The API key
  is kept only in page memory and is not saved. Configure provider CORS/network access as needed.
- Feed loading requires a public JSON or RSS URL that permits browser CORS. Video/Web links open in
  a separate tab. Browser notifications require user permission.
- Windows taskbar residency, mobile push notifications, social-feed publishing, actual six-axis
  face pose, provider credentials, and PlayCanvas-hosted publishing require platform services or
  account setup and are not included in this self-contained starter.

No camera, microphone, chat or feed data is sent anywhere by default. The external LLM and feed
features contact only the URLs you enter.

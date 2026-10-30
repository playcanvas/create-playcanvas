import {
    AppBase,
    AppOptions,
    Asset,
    CameraComponentSystem,
    Color,
    ContainerHandler,
    Entity,
    FILLMODE_FILL_WINDOW,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    StandardMaterial,
    TextureHandler,
    createGraphicsDevice
} from 'playcanvas';

type SpeechResult = { 0: { transcript: string } };
type SpeechResultEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type SpeechRecognitionLike = {
    lang: string;
    interimResults: boolean;
    onresult: ((event: SpeechResultEvent) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
};
type FaceBox = { boundingBox: { x: number; y: number; width: number; height: number } };
type FaceDetectorLike = { detect(video: HTMLVideoElement): Promise<FaceBox[]> };
type StudioWindow = Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    FaceDetector?: new (options?: { maxDetectedFaces?: number }) => FaceDetectorLike;
};

const PALETTES = {
    sakura: { label: 'さくら', color: new Color(0.95, 0.3, 0.55) },
    ocean: { label: 'オーシャン', color: new Color(0.12, 0.48, 0.9) },
    mint: { label: 'ミント', color: new Color(0.1, 0.72, 0.56) }
};

const markup = `
    <main class="studio-panel" aria-label="VTuber Studio controls">
        <header class="studio-header">
            <div><span class="studio-kicker">PLAYCANVAS · AVATAR DEMO</span><h1>VTuber Studio</h1></div>
            <span class="studio-status" id="studio-status" role="status" aria-live="polite">準備中...</span>
        </header>
        <p class="studio-help">モデルをタップしてみてね。カメラ・マイクはボタンを押した時だけ起動します。</p>
        <section class="studio-section">
            <h2>アバター</h2>
            <div class="studio-row">
                <label class="studio-button file-button">VRM / GLB を選ぶ<input id="avatar-file" type="file" accept=".vrm,.glb" /></label>
                <label class="studio-select-label" for="material-preset">カラー</label>
                <select id="material-preset" aria-label="マテリアルカラー">
                    <option value="sakura">さくら</option><option value="ocean">オーシャン</option><option value="mint">ミント</option>
                </select>
            </div>
            <div class="studio-row">
                <button id="camera-toggle" type="button">カメラ追跡を開始</button>
                <button id="mic-toggle" type="button">音声入力を開始</button>
            </div>
            <video id="camera-preview" class="camera-preview" muted playsinline></video>
            <p id="camera-status" class="studio-note" aria-live="polite">顔位置追跡は対応ブラウザでのみ利用できます。</p>
        </section>
        <section class="studio-section">
            <h2>会話</h2>
            <div id="chat-log" class="chat-log" aria-live="polite"><p class="chat-message avatar-message">こんにちは！モデルをタップすると反応するよ。</p></div>
            <form id="chat-form" class="studio-row">
                <label class="visually-hidden" for="chat-input">メッセージ</label>
                <input id="chat-input" type="text" placeholder="メッセージを入力..." autocomplete="off" />
                <button type="submit">送信</button>
            </form>
            <div class="studio-row">
                <button id="speak-toggle" type="button">読み上げ</button>
                <select id="voice-select" aria-label="読み上げ音声"><option value="">システム音声</option></select>
            </div>
            <details>
                <summary>LLM 接続設定（任意）</summary>
                <label>OpenAI互換 Chat Completions URL<input id="llm-url" type="url" placeholder="http://localhost:1234/v1/chat/completions" /></label>
                <label>モデル名<input id="llm-model" type="text" placeholder="モデル名を入力" /></label>
                <label>APIキー（必要な場合のみ）<input id="llm-key" type="password" autocomplete="off" placeholder="ページを閉じると破棄" /></label>
                <p class="studio-note">未設定時はオフラインのデモ応答を使います。APIキーは保存されません。</p>
            </details>
        </section>
        <section class="studio-section">
            <h2>Web・お知らせ</h2>
            <label>公開 JSON / RSS フィード URL<input id="feed-url" type="url" placeholder="https://example.com/feed.json" /></label>
            <div class="studio-row">
                <button id="feed-load" type="button">フィードを読み込む</button>
                <button id="notify-toggle" type="button">通知を許可</button>
            </div>
            <ul id="feed-items" class="feed-items"></ul>
            <label>動画・Web URL<input id="web-url" type="url" placeholder="https://example.com" /></label>
            <button id="web-open" type="button">別タブで開く</button>
            <p class="studio-note">Windows常駐・スマホPush・SNS投稿には別途サービス連携が必要です。</p>
        </section>
    </main>`;

const safeHttpUrl = (value: string) => {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error('http または https の URL を入力してください。');
    }
    return url;
};

const localReply = (message: string) => {
    if (/こんにちは|おはよう|こんばんは/.test(message)) return 'こんにちは！今日は何をして遊ぼうか？';
    if (/名前/.test(message)) return 'わたしはミオ。PlayCanvasのアバターデモだよ。';
    if (/ありがとう/.test(message)) return 'どういたしまして！また話しかけてね。';
    return `「${message}」っていうお話、聞かせてくれてありがとう！`;
};

export const createStudio = async (canvas: HTMLCanvasElement) => {
    const device = await createGraphicsDevice(canvas);
    device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem];
    options.resourceHandlers = [TextureHandler, ContainerHandler];

    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
    app.scene.ambientLight = new Color(0.42, 0.4, 0.48);

    const makeMaterial = (color: Color) => {
        const material = new StandardMaterial();
        material.diffuse = color;
        material.metalness = 0.05;
        material.gloss = 0.35;
        material.update();
        return material;
    };
    const pink = makeMaterial(PALETTES.sakura.color);
    const skin = makeMaterial(new Color(1, 0.72, 0.57));
    const white = makeMaterial(new Color(1, 0.96, 0.92));
    const dark = makeMaterial(new Color(0.12, 0.08, 0.18));
    const floorMaterial = makeMaterial(new Color(0.18, 0.13, 0.23));

    const floor = new Entity('studio floor');
    floor.setLocalScale(12, 0.15, 12);
    floor.setPosition(0, -0.13, 0);
    floor.addComponent('render', { type: 'box', material: floorMaterial });
    app.root.addChild(floor);

    const avatar = new Entity('avatar');
    app.root.addChild(avatar);
    const part = (
        name: string,
        position: [number, number, number],
        scale: [number, number, number],
        material: StandardMaterial,
        shape: 'box' | 'sphere' = 'sphere'
    ) => {
        const entity = new Entity(name);
        entity.setLocalPosition(...position);
        entity.setLocalScale(...scale);
        entity.addComponent('render', { type: shape, material });
        avatar.addChild(entity);
        return entity;
    };
    part('outfit', [0, 0.67, 0], [0.66, 0.95, 0.42], pink, 'box');
    part('head', [0, 1.56, 0], [0.64, 0.72, 0.58], skin);
    part('hair', [0, 1.91, -0.08], [0.7, 0.35, 0.61], dark);
    part('left eye', [-0.2, 1.58, 0.51], [0.075, 0.12, 0.055], dark);
    part('right eye', [0.2, 1.58, 0.51], [0.075, 0.12, 0.055], dark);
    part('left shine', [-0.22, 1.62, 0.558], [0.025, 0.035, 0.018], white);
    part('right shine', [0.18, 1.62, 0.558], [0.025, 0.035, 0.018], white);
    part('smile', [0, 1.39, 0.55], [0.09, 0.025, 0.02], dark);
    const leftArm = part('left arm', [-0.45, 0.68, 0], [0.18, 0.58, 0.2], pink);
    const rightArm = part('right arm', [0.45, 0.68, 0], [0.18, 0.58, 0.2], pink);
    part('left leg', [-0.18, 0.08, 0], [0.2, 0.35, 0.22], dark, 'box');
    part('right leg', [0.18, 0.08, 0], [0.2, 0.35, 0.22], dark, 'box');

    const camera = new Entity('camera');
    camera.addComponent('camera', { clearColor: new Color(0.12, 0.1, 0.18), fov: 34 });
    camera.setPosition(0, 1.5, 5.2);
    camera.lookAt(0, 1.12, 0);
    app.root.addChild(camera);

    const light = new Entity('key light');
    light.addComponent('light', { type: 'directional', intensity: 2.2, castShadows: true });
    light.setEulerAngles(35, 25, 0);
    app.root.addChild(light);
    const fill = new Entity('fill light');
    fill.addComponent('light', { type: 'omni', intensity: 0.8, range: 9, color: new Color(0.46, 0.6, 1) });
    fill.setPosition(-3, 3, 2);
    app.root.addChild(fill);

    let reaction = 0;
    let faceInterval = 0;
    let mediaStream: MediaStream | null = null;
    let recognition: SpeechRecognitionLike | null = null;
    let activeAsset: Asset | null = null;
    let activeObjectUrl: string | null = null;
    let customAvatar: Entity | null = null;
    let pointerX = 0;
    let pointerY = 0;
    const panel = document.createElement('div');
    panel.className = 'studio-hud';
    panel.innerHTML = markup;
    document.body.append(panel);

    const query = <T extends HTMLElement>(selector: string) => {
        const element = panel.querySelector<T>(selector);
        if (!element) throw new Error(`VTuber Studio UI is missing ${selector}`);
        return element;
    };
    const status = query<HTMLSpanElement>('#studio-status');
    const cameraStatus = query<HTMLParagraphElement>('#camera-status');
    const setStatus = (message: string) => {
        status.textContent = message;
    };
    const chatLog = query<HTMLDivElement>('#chat-log');
    const addMessage = (role: 'user' | 'avatar', text: string) => {
        const message = document.createElement('p');
        message.className = `chat-message ${role}-message`;
        message.textContent = text;
        chatLog.append(message);
        chatLog.scrollTop = chatLog.scrollHeight;
    };
    const react = () => {
        reaction = 1;
        setStatus('タップに反応中');
    };
    const onPointerDown = () => react();
    const onPointerMove = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);

    const addReply = async (message: string) => {
        const endpoint = query<HTMLInputElement>('#llm-url').value.trim();
        if (!endpoint) return localReply(message);
        const url = safeHttpUrl(endpoint).toString();
        const model = query<HTMLInputElement>('#llm-model').value.trim();
        if (!model) throw new Error('LLM接続にはモデル名が必要です。');
        const key = query<HTMLInputElement>('#llm-key').value.trim();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (key) headers.Authorization = `Bearer ${key}`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: 'あなたは親しみやすい日本語のアバターです。短く返答してください。' },
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            }),
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) throw new Error(`LLM応答エラー: HTTP ${response.status}`);
        const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('LLM応答にメッセージがありません。');
        return reply;
    };
    query<HTMLFormElement>('#chat-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = query<HTMLInputElement>('#chat-input');
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        addMessage('user', message);
        setStatus(query<HTMLInputElement>('#llm-url').value.trim() ? 'LLMに接続中...' : 'デモ応答を生成中...');
        try {
            const reply = await addReply(message);
            addMessage('avatar', reply);
            reaction = 1;
            setStatus(
                query<HTMLInputElement>('#llm-url').value.trim() ? 'LLM応答を受信しました' : 'オフラインデモ応答'
            );
        } catch (error) {
            const explanation = error instanceof Error ? error.message : String(error);
            addMessage('avatar', `応答できませんでした: ${explanation}`);
            setStatus('会話エラー');
        }
    });

    const voices = query<HTMLSelectElement>('#voice-select');
    const updateVoices = () => {
        const selected = voices.value;
        voices.replaceChildren(new Option('システム音声', ''));
        for (const voice of window.speechSynthesis?.getVoices() ?? []) {
            voices.add(new Option(`${voice.name} (${voice.lang})`, voice.name));
        }
        voices.value = selected;
    };
    if ('speechSynthesis' in window) {
        updateVoices();
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    } else {
        query<HTMLButtonElement>('#speak-toggle').disabled = true;
    }
    query<HTMLButtonElement>('#speak-toggle').addEventListener('click', () => {
        if (!('speechSynthesis' in window)) {
            setStatus('このブラウザは音声読み上げに対応していません');
            return;
        }
        const latestMessage = chatLog.querySelector('.avatar-message:last-child');
        const text = latestMessage?.textContent?.trim();
        if (!text) {
            setStatus('読み上げるメッセージがありません');
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.onend = () => setStatus('読み上げ完了');
        utterance.onerror = () => setStatus('音声読み上げに失敗しました');
        const selectedVoice = window.speechSynthesis.getVoices().find((voice) => voice.name === voices.value);
        if (selectedVoice) utterance.voice = selectedVoice;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    });

    const speechWindow = window as StudioWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    const micButton = query<HTMLButtonElement>('#mic-toggle');
    if (!Recognition) micButton.textContent = '音声入力は非対応';
    micButton.addEventListener('click', () => {
        if (!Recognition) {
            setStatus('このブラウザは音声認識に対応していません');
            return;
        }
        if (recognition) {
            recognition.stop();
            recognition = null;
            micButton.textContent = '音声入力を開始';
            return;
        }
        const nextRecognition = new Recognition();
        recognition = nextRecognition;
        nextRecognition.lang = 'ja-JP';
        nextRecognition.interimResults = false;
        nextRecognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .slice(event.resultIndex)
                .map((result) => result[0].transcript)
                .join(' ')
                .trim();
            query<HTMLInputElement>('#chat-input').value = transcript;
            query<HTMLFormElement>('#chat-form').requestSubmit();
        };
        nextRecognition.onerror = (event) => {
            setStatus(`音声認識エラー: ${event.error}`);
            recognition = null;
            micButton.textContent = '音声入力を開始';
        };
        nextRecognition.onend = () => {
            recognition = null;
            micButton.textContent = '音声入力を開始';
        };
        try {
            nextRecognition.start();
            micButton.textContent = '音声入力を停止';
            setStatus('音声入力中...');
        } catch (error) {
            recognition = null;
            setStatus(`音声入力を開始できません: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    const cameraButton = query<HTMLButtonElement>('#camera-toggle');
    const video = query<HTMLVideoElement>('#camera-preview');
    const stopCamera = () => {
        window.clearInterval(faceInterval);
        faceInterval = 0;
        mediaStream?.getTracks().forEach((track) => track.stop());
        mediaStream = null;
        video.srcObject = null;
        video.classList.remove('visible');
        cameraButton.textContent = 'カメラ追跡を開始';
        cameraStatus.textContent = 'カメラを停止しました。';
        camera.setPosition(0, 1.5, 5.2);
        camera.lookAt(0, 1.12, 0);
    };
    cameraButton.addEventListener('click', async () => {
        if (mediaStream) {
            stopCamera();
            setStatus('カメラを停止しました');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            cameraStatus.textContent = 'このブラウザではカメラを利用できません。HTTPSまたはlocalhostで開いてください。';
            setStatus('カメラ非対応');
            return;
        }
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            video.srcObject = mediaStream;
            await video.play();
            video.classList.add('visible');
            cameraButton.textContent = 'カメラを停止';
            const FaceDetector = speechWindow.FaceDetector;
            if (!FaceDetector) {
                cameraStatus.textContent =
                    'カメラ映像は表示中ですが、このブラウザにFaceDetectorがないため顔位置は追跡できません。';
                setStatus('顔位置追跡は非対応');
                return;
            }
            const detector = new FaceDetector({ maxDetectedFaces: 1 });
            cameraStatus.textContent = '顔位置を推定中（未校正の3軸移動・6DoF姿勢ではありません）。';
            faceInterval = window.setInterval(async () => {
                if (!mediaStream || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
                try {
                    const faces = await detector.detect(video);
                    const face = faces[0]?.boundingBox;
                    if (!face) {
                        cameraStatus.textContent = '顔が見つかりません。カメラに顔を向けてください。';
                        return;
                    }
                    const x = (face.x + face.width / 2) / video.videoWidth - 0.5;
                    const y = (face.y + face.height / 2) / video.videoHeight - 0.5;
                    const size = face.width / video.videoWidth;
                    camera.setPosition(-x * 1.2, 1.5 - y * 0.8, 5.2 - Math.min(size * 2, 0.9));
                    camera.lookAt(0, 1.12, 0);
                    cameraStatus.textContent = `顔位置を追跡中 · X ${x.toFixed(2)} · Y ${y.toFixed(2)} · 距離推定 ${size.toFixed(2)}`;
                    setStatus('顔位置追跡中');
                } catch (error) {
                    window.clearInterval(faceInterval);
                    faceInterval = 0;
                    cameraStatus.textContent = `顔位置検出エラー: ${error instanceof Error ? error.message : String(error)}`;
                    setStatus('顔位置検出エラー');
                }
            }, 180);
            if (!faceInterval) setStatus('カメラ映像を表示中');
        } catch (error) {
            stopCamera();
            const explanation = error instanceof Error ? error.message : String(error);
            cameraStatus.textContent = `カメラを開始できませんでした: ${explanation}`;
            setStatus('カメラ権限またはデバイスを確認してください');
        }
    });

    const fileInput = query<HTMLInputElement>('#avatar-file');
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        if (!/\.(glb|vrm)$/i.test(file.name)) {
            setStatus('対応形式はGLBまたはVRMです');
            return;
        }
        setStatus(`${file.name} を読み込み中...`);
        const objectUrl = URL.createObjectURL(file);
        const asset = new Asset(file.name, 'container', { url: objectUrl });
        try {
            app.assets.add(asset);
            await new Promise<void>((resolve, reject) => {
                asset.once('load', () => resolve());
                asset.once('error', (_asset, error) => reject(new Error(String(error ?? '読み込み失敗'))));
                app.assets.load(asset);
            });
            if (!asset.resource) throw new Error('モデルリソースを読み込めませんでした。');
            const instance = asset.resource.instantiateRenderEntity();
            instance.setLocalScale(0.9, 0.9, 0.9);
            if (customAvatar) customAvatar.destroy();
            customAvatar = instance;
            avatar.addChild(instance);
            avatar.children.filter((child) => child !== instance).forEach((child) => (child.enabled = false));
            if (activeAsset) {
                app.assets.remove(activeAsset);
                activeAsset.unload();
            }
            if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
            activeAsset = asset;
            activeObjectUrl = objectUrl;
            setStatus(`${file.name} を表示しました（VRM拡張・アニメーションは別途設定が必要です）`);
        } catch (error) {
            app.assets.remove(asset);
            asset.unload();
            URL.revokeObjectURL(objectUrl);
            const explanation = error instanceof Error ? error.message : String(error);
            setStatus(`モデルを読み込めませんでした: ${explanation}`);
        } finally {
            fileInput.value = '';
        }
    });

    query<HTMLSelectElement>('#material-preset').addEventListener('change', (event) => {
        const selected = (event.currentTarget as HTMLSelectElement).value as keyof typeof PALETTES;
        const color = PALETTES[selected]?.color;
        if (!color) return;
        pink.diffuse = color;
        pink.update();
        if (customAvatar) {
            const replacement = makeMaterial(color);
            for (const render of customAvatar.findComponents('render')) {
                for (const mesh of render.meshInstances) mesh.material = replacement;
            }
        }
        setStatus(`${PALETTES[selected].label}カラーに変更しました`);
    });

    query<HTMLButtonElement>('#feed-load').addEventListener('click', async () => {
        const feedUrl = query<HTMLInputElement>('#feed-url').value.trim();
        if (!feedUrl) {
            setStatus('フィードURLを入力してください');
            return;
        }
        try {
            const response = await fetch(safeHttpUrl(feedUrl), { signal: AbortSignal.timeout(15000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            const items =
                text.trimStart().startsWith('{') || text.trimStart().startsWith('[')
                    ? (() => {
                          const data = JSON.parse(text) as
                              { items?: { title?: string; url?: string }[] } | { title?: string; url?: string }[];
                          return Array.isArray(data) ? data : (data.items ?? []);
                      })()
                    : Array.from(new DOMParser().parseFromString(text, 'text/xml').querySelectorAll('item, entry')).map(
                          (item) => ({
                              title: item.querySelector('title')?.textContent ?? 'タイトルなし',
                              url:
                                  item.querySelector('link')?.getAttribute('href') ??
                                  item.querySelector('link')?.textContent ??
                                  ''
                          })
                      );
            const list = query<HTMLUListElement>('#feed-items');
            list.replaceChildren();
            for (const item of items.slice(0, 8)) {
                const li = document.createElement('li');
                li.textContent = item.title ?? 'タイトルなし';
                list.append(li);
            }
            setStatus(`フィードを読み込みました（${Math.min(items.length, 8)}件）`);
        } catch (error) {
            const explanation = error instanceof Error ? error.message : String(error);
            setStatus(`フィードを読み込めませんでした: ${explanation}（CORS設定も確認してください）`);
        }
    });

    query<HTMLButtonElement>('#web-open').addEventListener('click', () => {
        try {
            const url = safeHttpUrl(query<HTMLInputElement>('#web-url').value.trim());
            window.open(url, '_blank', 'noopener,noreferrer');
            setStatus('Webページを別タブで開きました');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : String(error));
        }
    });

    query<HTMLButtonElement>('#notify-toggle').addEventListener('click', async () => {
        if (!('Notification' in window)) {
            setStatus('このブラウザは通知に対応していません');
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification('VTuber Studio', { body: 'ブラウザ通知が有効になりました。' });
            setStatus('ブラウザ通知を許可しました');
        } else {
            setStatus(`通知は許可されませんでした（${permission}）`);
        }
    });

    let animationTime = 0;
    const update = (dt: number) => {
        animationTime += dt;
        const bounce = Math.sin(animationTime * 2) * 0.025;
        const avatarOffsetX = window.innerWidth > 700 ? -0.7 : 0;
        avatar.setLocalPosition(avatarOffsetX, bounce + reaction * 0.1, 0);
        avatar.setLocalEulerAngles(pointerY * -8 + Math.sin(animationTime * 0.75) * 2, pointerX * 14, reaction * 4);
        leftArm.setLocalEulerAngles(0, 0, 8 + reaction * 24);
        rightArm.setLocalEulerAngles(0, 0, -8 - reaction * 24);
        reaction = Math.max(0, reaction - dt * 1.6);
    };
    app.on('update', update);
    app.start();

    const onResize = () => app.resizeCanvas();
    window.addEventListener('resize', onResize);
    setStatus('デモアバター起動中');

    return () => {
        window.removeEventListener('resize', onResize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        window.speechSynthesis?.removeEventListener('voiceschanged', updateVoices);
        window.speechSynthesis?.cancel();
        recognition?.stop();
        stopCamera();
        app.off('update', update);
        if (activeAsset) {
            app.assets.remove(activeAsset);
            activeAsset.unload();
        }
        if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
        panel.remove();
        app.destroy();
    };
};

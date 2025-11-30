# POV Video Generator

AI が自動で一人称視点 (POV) の動画を生成するシステムです。

## 🎯 機能

- ブラウザから動画アイデアを入力
- AI が自動で 5シーンの POV 動画を生成
- リアルタイム進捗表示
- 完成動画のプレビュー・ダウンロード
- プロジェクト履歴管理

## 📦 必要なもの

- Node.js 18以上
- Docker (n8n用)
- 各種APIキー (OpenAI, PiAPI, ElevenLabs, Creatomate)

## 🚀 クイックスタート

### 1. プロジェクトセットアップ

```bash
# Next.jsプロジェクト作成
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 依存関係インストール
npm install firebase clsx
```

### 2. 環境変数設定

`.env.local` ファイルを作成:

```bash
# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/pov-video-generation

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. n8n起動

```bash
# n8n用ディレクトリ作成
mkdir -p ~/n8n-data ~/n8n-files

# Docker で n8n 起動
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_SERVE_FILES=true \
  -e N8N_FILES_PATH=/home/node/files \
  -e N8N_BASE_URL=http://localhost:5678 \
  -v ~/n8n-data:/home/node/.n8n \
  -v ~/n8n-files:/home/node/files \
  n8nio/n8n

# n8n にアクセス
open http://localhost:5678
```

### 4. ワークフローインポート

1. n8n 管理画面で「Workflows」→「Import from File」
2. `n8n_workflow_pov_video_generator.json` を選択
3. 各ノードの API キーを設定
4. 「Save」→「Activate」

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 📖 詳細ドキュメント

完全な実装手順は [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) を参照してください。

## 💰 コスト

- **インフラ**: $20/月 (n8n VPS)
- **動画生成**: ~$3.50/本
- **月10本生成**: 合計 $55/月

## 📝 ライセンス

MIT

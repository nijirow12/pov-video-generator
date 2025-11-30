# POV動画生成システム 完全実装ガイド

> **プロジェクト名**: POV Video Generator  
> **目的**: ブラウザから簡単にAI生成POV動画を作成できる個人用システム  
> **技術スタック**: Next.js + n8n + Firestore + AI APIs

---

## 📋 目次

1. [システム概要](#システム概要)
2. [前提条件](#前提条件)
3. [セットアップ手順](#セットアップ手順)
4. [n8nワークフロー設定](#n8nワークフロー設定)
5. [Reactアプリケーション実装](#reactアプリケーション実装)
6. [デプロイ](#デプロイ)
7. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 システム概要

### 機能

- ブラウザから動画アイデアを入力
- AI が自動で 5シーンの POV 動画を生成
- リアルタイム進捗表示
- 完成動画のプレビュー・ダウンロード
- プロジェクト履歴管理

### アーキテクチャ

```
┌─────────────────┐
│  React Frontend │ ← ユーザーインターフェース
│   (Next.js)     │
└────────┬────────┘
         │ Webhook
         ↓
┌─────────────────┐
│  n8n Workflow   │ ← 動画生成エンジン
│  (VPS/Docker)   │
└────────┬────────┘
         │
         ├→ OpenAI (タイトル・プロンプト生成)
         ├→ PiAPI (画像・動画生成)
         ├→ ElevenLabs (音声生成)
         └→ Creatomate (最終編集)
         
┌─────────────────┐
│   Firestore     │ ← プロジェクト管理
└─────────────────┘
```

### 処理フロー

1. **入力**: ユーザーが動画アイデアと環境を入力
2. **タイトル生成**: OpenAI が 5つのシーンタイトルを生成
3. **プロンプト拡張**: 各タイトルを詳細なプロンプトに変換
4. **画像生成**: Flux1-dev で各シーンの画像を生成 (15分)
5. **動画生成**: Kling で画像から動画を生成 (50分)
6. **音声生成**: ElevenLabs で環境音を生成 (5分)
7. **最終編集**: Creatomate で全要素を統合 (5分)
8. **完了**: ブラウザで視聴・ダウンロード

**合計処理時間: 約70分**

---

## 🔧 前提条件

### 必須アカウント

| サービス | 用途 | 無料枠 | 登録URL |
|---------|------|--------|---------|
| **OpenAI** | タイトル・プロンプト生成 | $5クレジット | https://platform.openai.com/ |
| **PiAPI** | 画像・動画生成 | なし | https://piapi.ai/ |
| **ElevenLabs** | 音声生成 | 10,000文字/月 | https://elevenlabs.io/ |
| **Creatomate** | 動画編集 | 25レンダー/月 | https://creatomate.com/ |
| **Firebase** | データベース | 50K reads/day | https://firebase.google.com/ |
| **Vercel** | ホスティング | Hobby無料 | https://vercel.com/ |

### 必須ツール

```bash
# Node.js (v18以上)
node --version  # v18.0.0以上

# npm
npm --version   # 9.0.0以上

# Git
git --version

# n8n (Docker推奨)
docker --version
```

---

## 🚀 セットアップ手順

### Step 1: プロジェクトクローン

```bash
cd /Users/niji/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/nijivault/project/pov-video-generator

# 確認
pwd
# /Users/niji/Library/Mobile Documents/iCloud~md~obsidian/Documents/nijivault/project/pov-video-generator
```

### Step 2: Next.jsプロジェクト作成

```bash
# Next.jsプロジェクト初期化
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 質問への回答:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Turbopack? … No
# ✔ Would you like to customize the default import alias? … No
```

### Step 3: 依存関係インストール

```bash
# Firebase (Firestore)
npm install firebase

# その他のユーティリティ
npm install clsx
```

### Step 4: 環境変数設定

```bash
# .env.local ファイルを作成
touch .env.local
```

`.env.local` に以下を記述:

```bash
# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/pov-video-generation

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 5: Firebase プロジェクト作成

1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `pov-video-generator`
4. Google アナリティクスは不要
5. プロジェクト作成後、「ウェブアプリを追加」
6. 表示された設定情報を `.env.local` にコピー

**Firestore 有効化:**

1. 左メニュー「Firestore Database」
2. 「データベースを作成」
3. 本番環境モードで開始
4. ロケーション: `asia-northeast1` (東京)

**セキュリティルール設定:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if true; // 開発用 (本番では認証追加)
    }
  }
}
```

---

## 🔧 n8nワークフロー設定

### Step 1: n8n インストール (Docker)

```bash
# n8n用ディレクトリ作成
mkdir -p ~/n8n-data

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

### Step 2: API認証情報設定

n8n管理画面で以下の認証情報を追加:

#### OpenAI

1. 左メニュー「Credentials」→「Add Credential」
2. 「OpenAI」を選択
3. API Key: `sk-...` (OpenAI から取得)
4. 保存

#### PiAPI

1. 「HTTP Request」用の Header 認証
2. Name: `X-API-Key`
3. Value: PiAPI の API Key

#### ElevenLabs

1. 「HTTP Request」用の Header 認証
2. Name: `xi-api-key`
3. Value: ElevenLabs の API Key

#### Creatomate

1. 「HTTP Request」用の Bearer Token
2. Token: Creatomate の API Key

### Step 3: ワークフローインポート

1. n8n 管理画面で「Workflows」→「Import from File」
2. `n8n_workflow_pov_video_generator.json` を選択
3. インポート完了後、各ノードの認証情報を設定
4. 「Save」→「Activate」

### Step 4: Webhook URL 確認

1. ワークフロー内の「Webhook Trigger」ノードをクリック
2. 「Webhook URLs」セクションで Production URL をコピー
3. `.env.local` の `N8N_WEBHOOK_URL` に設定

例: `http://localhost:5678/webhook/pov-video-generation`

---

## 💻 Reactアプリケーション実装

### ディレクトリ構造

以下の構造でファイルを作成します:

```
pov-video-generator/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # ホームページ
│   ├── projects/
│   │   ├── page.tsx            # プロジェクト一覧
│   │   ├── new/
│   │   │   └── page.tsx        # 新規作成
│   │   └── [id]/
│   │       └── page.tsx        # プロジェクト詳細
│   └── api/
│       ├── n8n/
│       │   └── trigger/
│       │       └── route.ts    # n8nトリガー
│       └── projects/
│           ├── route.ts        # プロジェクト一覧
│           └── [id]/
│               └── route.ts    # プロジェクト詳細
├── components/
│   ├── ProjectForm.tsx         # 作成フォーム
│   ├── ProjectList.tsx         # 一覧表示
│   ├── ProgressTracker.tsx     # 進捗表示
│   └── VideoPlayer.tsx         # 動画プレーヤー
├── lib/
│   ├── firebase.ts             # Firebase設定
│   ├── db.ts                   # DB操作
│   ├── n8n-client.ts           # n8nクライアント
│   └── types.ts                # 型定義
└── hooks/
    ├── useN8nWorkflow.ts       # ワークフロー実行
    └── useProject.ts           # プロジェクト管理
```

### 実装ファイル

#### 1. 型定義 (`lib/types.ts`)

```typescript
export interface Project {
  id: string;
  idea: string;
  environmentPrompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  scenes?: Scene[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface Scene {
  title: string;
  imageUrl: string;
  videoUrl: string;
  soundUrl: string;
}

export interface N8nResponse {
  success: boolean;
  projectId: string;
  idea: string;
  videoUrl: string;
  scenes: Scene[];
  completedAt: string;
}
```

#### 2. Firebase設定 (`lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { app, db };
```

#### 3. データベース操作 (`lib/db.ts`)

```typescript
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from './types';

const projectsCollection = collection(db, 'projects');

export class ProjectDatabase {
  async createProject(project: Omit<Project, 'id'>): Promise<string> {
    const docRef = await addDoc(projectsCollection, {
      ...project,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async getProject(id: string): Promise<Project | null> {
    const docRef = doc(db, 'projects', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
    } as Project;
  }

  async getAllProjects(): Promise<Project[]> {
    const q = query(projectsCollection, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
      } as Project;
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    const docRef = doc(db, 'projects', id);
    const updateData: any = { ...data };
    
    if (data.completedAt) {
      updateData.completedAt = Timestamp.fromDate(data.completedAt);
    }
    
    await updateDoc(docRef, updateData);
  }
}
```

#### 4. n8nクライアント (`lib/n8n-client.ts`)

```typescript
import type { N8nResponse } from './types';

export class N8nClient {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL!;
  }

  async triggerWorkflow(data: {
    idea: string;
    environmentPrompt: string;
  }): Promise<N8nResponse> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger n8n workflow');
    }

    return await response.json();
  }
}
```

#### 5. API Route - トリガー (`app/api/n8n/trigger/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { ProjectDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea, environmentPrompt } = body;

    if (!idea || !environmentPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = new ProjectDatabase();
    
    // プロジェクト作成
    const projectId = await db.createProject({
      idea,
      environmentPrompt,
      status: 'processing',
      createdAt: new Date(),
    });

    // n8n実行 (バックグラウンド)
    const n8n = new N8nClient();
    
    n8n.triggerWorkflow({ idea, environmentPrompt })
      .then(async (result) => {
        await db.updateProject(projectId, {
          status: 'completed',
          videoUrl: result.videoUrl,
          scenes: result.scenes,
          completedAt: new Date(),
        });
      })
      .catch(async (error) => {
        await db.updateProject(projectId, {
          status: 'failed',
          error: error.message,
        });
      });

    return NextResponse.json({
      success: true,
      projectId,
      message: 'Video generation started',
    });
  } catch (error) {
    console.error('Failed to trigger workflow:', error);
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
}
```

#### 6. API Route - プロジェクト取得 (`app/api/projects/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = new ProjectDatabase();
    const projects = await db.getAllProjects();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to get projects:', error);
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    );
  }
}
```

#### 7. API Route - プロジェクト詳細 (`app/api/projects/[id]/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = new ProjectDatabase();
    const project = await db.getProject(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to get project:', error);
    return NextResponse.json(
      { error: 'Failed to get project' },
      { status: 500 }
    );
  }
}
```

#### 8. Hook - ワークフロー実行 (`hooks/useN8nWorkflow.ts`)

```typescript
'use client';

import { useState } from 'react';

export function useN8nWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGeneration = async (data: {
    idea: string;
    environmentPrompt: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      const result = await response.json();
      return result.projectId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { startGeneration, loading, error };
}
```

#### 9. Hook - プロジェクト管理 (`hooks/useProject.ts`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setProject(data.project);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // 処理中の場合、10秒ごとにポーリング
    let intervalId: NodeJS.Timeout;
    if (project?.status === 'processing') {
      intervalId = setInterval(fetchProject, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectId, project?.status]);

  return { project, loading };
}
```

#### 10. コンポーネント - フォーム (`components/ProjectForm.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useN8nWorkflow } from '@/hooks/useN8nWorkflow';
import { useRouter } from 'next/navigation';

export function ProjectForm() {
  const [idea, setIdea] = useState('');
  const [environmentPrompt, setEnvironmentPrompt] = useState('');
  
  const { startGeneration, loading, error } = useN8nWorkflow();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectId = await startGeneration({
        idea,
        environmentPrompt,
      });

      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Video Idea *
        </label>
        <input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="A day in the life of a samurai"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          例: A day in the life of a medieval knight
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Environment Description *
        </label>
        <textarea
          value={environmentPrompt}
          onChange={(e) => setEnvironmentPrompt(e.target.value)}
          placeholder="Feudal Japan, cherry blossoms, traditional architecture..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          動画の環境・雰囲気を詳しく記述してください
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? '🔄 Starting...' : '🎬 Generate Video'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        ⏱️ 処理時間: 約70分 (画像生成15分 + 動画生成50分 + その他5分)
      </p>
    </form>
  );
}
```

#### 11. コンポーネント - 進捗トラッカー (`components/ProgressTracker.tsx`)

```typescript
'use client';

import { useProject } from '@/hooks/useProject';
import type { Project } from '@/lib/types';

export function ProgressTracker({ projectId }: { projectId: string }) {
  const { project, loading } = useProject(projectId);

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-gray-500">Project not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">{project.idea}</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          {project.createdAt && (
            <span className="text-sm text-gray-500">
              Started: {new Date(project.createdAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* 処理中 */}
      {project.status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <h3 className="text-lg font-semibold">Processing...</h3>
          </div>
          <p className="text-gray-600">
            動画を生成しています。このページを開いたままお待ちください。
            <br />
            完了まで約70分かかります。
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
        </div>
      )}

      {/* 完了 */}
      {project.status === 'completed' && project.videoUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            ✅ Video Generation Complete!
          </h3>
          
          {/* 動画プレーヤー */}
          <div className="mb-4">
            <video
              src={project.videoUrl}
              controls
              className="w-full rounded-lg shadow-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* ダウンロードボタン */}
          <a
            href={project.videoUrl}
            download={`${project.idea.replace(/\s+/g, '_')}.mp4`}
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            ⬇️ Download Video
          </a>

          {/* シーン一覧 */}
          {project.scenes && project.scenes.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Individual Scenes:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.scenes.map((scene, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <p className="text-sm font-medium mb-2">{scene.title}</p>
                    <div className="space-y-2">
                      <a
                        href={scene.videoUrl}
                        download
                        className="block text-xs text-blue-600 hover:underline"
                      >
                        📹 Video
                      </a>
                      <a
                        href={scene.imageUrl}
                        download
                        className="block text-xs text-blue-600 hover:underline"
                      >
                        🖼️ Image
                      </a>
                      <a
                        href={scene.soundUrl}
                        download
                        className="block text-xs text-blue-600 hover:underline"
                      >
                        🔊 Sound
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* エラー */}
      {project.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ❌ Generation Failed
          </h3>
          <p className="text-gray-600">
            {project.error || 'An unknown error occurred'}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const styles = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const labels = {
    pending: '⏸️ Pending',
    processing: '🔄 Processing',
    completed: '✅ Completed',
    failed: '❌ Failed',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
```

#### 12. ページ - ホーム (`app/page.tsx`)

```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            POV Video Generator
          </h1>
          <p className="text-xl text-gray-600">
            AI が自動で一人称視点の動画を生成します
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/projects/new"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-2">新しい動画を作成</h2>
            <p className="text-gray-600">
              アイデアを入力するだけで、AIが自動で動画を生成します
            </p>
          </Link>

          <Link
            href="/projects"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-2xl font-bold mb-2">プロジェクト一覧</h2>
            <p className="text-gray-600">
              過去に作成した動画を確認・ダウンロードできます
            </p>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📋 使い方</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>動画のアイデアと環境を入力</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>AIが自動で5シーンの動画を生成 (約70分)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>完成した動画をプレビュー・ダウンロード</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
```

#### 13. ページ - 新規作成 (`app/projects/new/page.tsx`)

```typescript
import { ProjectForm } from '@/components/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          新しい動画を作成
        </h1>
        <ProjectForm />
      </div>
    </div>
  );
}
```

#### 14. ページ - プロジェクト詳細 (`app/projects/[id]/page.tsx`)

```typescript
import { ProgressTracker } from '@/components/ProgressTracker';

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <ProgressTracker projectId={params.id} />
    </div>
  );
}
```

---

## 🚀 デプロイ

### Vercel へのデプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 環境変数設定 (Vercel)

Vercel ダッシュボードで以下を設定:

1. Settings → Environment Variables
2. `.env.local` の内容をコピー
3. Production / Preview / Development すべてに設定

---

## 🔍 トラブルシューティング

### n8n が起動しない

```bash
# ログ確認
docker logs n8n

# 再起動
docker restart n8n
```

### Firebase接続エラー

- `.env.local` の設定を確認
- Firebase コンソールでプロジェクトが有効か確認
- Firestore のセキュリティルールを確認

### 動画生成が失敗する

- n8n の各ノードのエラーログを確認
- API キーが正しく設定されているか確認
- API の利用制限に達していないか確認

---

## 💰 コスト見積もり

| 項目 | コスト |
|------|--------|
| n8n (VPS) | $20/月 |
| Vercel | $0/月 |
| Firestore | $0/月 (無料枠) |
| **インフラ合計** | **$20/月** |

| API | 1動画あたり |
|-----|------------|
| OpenAI | ~$0.16 |
| PiAPI | ~$2.75 |
| ElevenLabs | ~$0.08 |
| Creatomate | ~$0.50 |
| **API合計** | **~$3.50** |

**月10本生成: $20 + $35 = $55/月**

---

## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**作成日**: 2025年12月1日  
**バージョン**: 1.0  
**ライセンス**: MIT

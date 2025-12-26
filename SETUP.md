# DairyFarm Insight - セットアップガイド

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAnon Keyを取得

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. データベーススキーマの適用

SupabaseダッシュボードのSQL Editorで、`supabase/migrations/001_initial_schema.sql`の内容を実行してください。

または、Supabase CLIを使用している場合：

```bash
supabase db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

### 実装済み機能

- ✅ ユーザー認証（ログイン/サインアップ）
- ✅ ロールベースアクセス制御（Owner, Staff, Accountant）
- ✅ 収益管理（登録、一覧表示、削除）
- ✅ 支出管理（登録、一覧表示、削除）
- ✅ 畜群管理（登録、一覧表示、削除）
- ✅ 補助金・助成金管理
- ✅ ダッシュボード（月次利益、収益・支出サマリー）
- ✅ 会計データCSVエクスポート

### データベースビュー

- `monthly_profit`: 月次利益計算ビュー
- `profit_per_animal`: 頭当たり利益計算ビュー

### セキュリティ

- Row Level Security (RLS) がすべてのテーブルで有効
- ユーザーは自分の農場のデータのみアクセス可能
- ロールに基づいた操作権限の制御

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### 環境変数（本番環境）

本番環境でも同じ環境変数を設定してください：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## トラブルシューティング

### 認証エラー

- Supabaseの認証設定を確認
- 環境変数が正しく設定されているか確認

### データベースエラー

- RLSポリシーが正しく適用されているか確認
- プロファイルが作成されているか確認（初回ログイン時に自動作成）

### ビューのエラー

- `monthly_profit`や`profit_per_animal`ビューが正しく作成されているか確認
- データが存在する場合のみビューが結果を返します

## 今後の拡張

- OCR機能によるレシート自動入力
- 補助金自動推奨機能
- 高度な分析機能
- モバイルアプリ



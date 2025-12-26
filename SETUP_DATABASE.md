# データベースセットアップ手順

## 重要: データベースのマイグレーションを実行してください

`profiles`テーブルが存在しないエラーが発生している場合、データベースのマイグレーションが実行されていません。

## 手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左側のメニューから「SQL Editor」をクリック

### 2. マイグレーションファイルを実行

**重要**: 以下のファイルを順番に実行してください。

#### ステップ1: 基本スキーマの作成

`supabase/migrations/001_initial_schema.sql` の内容をコピーして、SQL Editorに貼り付けて実行してください。

このファイルには以下が含まれます：
- テーブルの作成（profiles, herds, animals, revenue, expenses, subsidies）
- インデックスの作成
- RLSポリシーの設定
- ビューの作成（monthly_profit, profit_per_animal）
- トリガーの設定

#### ステップ2: 実行

「Run」ボタンをクリックして実行してください。

### 3. エラーが発生した場合

既存のテーブルがある場合、エラーが発生する可能性があります。その場合は、以下のSQLを実行してテーブルを確認してください：

```sql
-- 既存のテーブルを確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

既存のテーブルがある場合は、以下のいずれかを選択してください：

#### オプションA: 既存のテーブルを削除して再作成（開発環境のみ）

```sql
-- 警告: この操作はすべてのデータを削除します
DROP TABLE IF EXISTS subsidies CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS revenue CASCADE;
DROP TABLE IF EXISTS animals CASCADE;
DROP TABLE IF EXISTS herds CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- その後、001_initial_schema.sql を実行
```

#### オプションB: 既存のテーブルを保持（推奨）

既存のテーブルがある場合は、マイグレーションファイルの該当部分をスキップして、不足している部分のみを実行してください。

### 4. 確認

マイグレーションが成功したら、以下のSQLでテーブルが作成されたことを確認してください：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'herds', 'animals', 'revenue', 'expenses', 'subsidies');
```

すべてのテーブルが表示されれば成功です。

## トラブルシューティング

### エラー: "relation already exists"

テーブルが既に存在する場合、マイグレーションファイルの`CREATE TABLE`部分をスキップして、RLSポリシーやビューの部分のみを実行してください。

### エラー: "permission denied"

Supabaseのプロジェクトオーナーまたは管理者権限で実行していることを確認してください。

### エラー: "type does not exist"

ENUM型が作成されていない場合、マイグレーションファイルの最初の部分（ENUM型の作成）から実行してください。


-- pgvector拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS vector;
    -- pgvectorではなくvectorに変更

-- EMBEDDING_MODELS テーブル
    -- Embeddingを作成する異なるモデルを管理する
        -- is_currentフラグで現在のデフォルトモデルを指定
        -- CURRENT_EMBEDDING_MODELビューで現在のデフォルトモデルを取得
        -- CURRENT_IMAGE_EMBEDDINGSビューで現在のデフォルトモデルの画像Embeddingを取得
CREATE TABLE EMBEDDING_MODELS (
    model_id SERIAL PRIMARY KEY, -- SERIAL: 連番を生成(主キーや一意のIDの生成に利用される)
    model_name VARCHAR(255), -- VARCHAR: 可変長文字列型
    model_version VARCHAR(50),
    is_current CHAR(1) CHECK (is_current IN ('Y', 'N')), -- CHECK: 追加するデータが指定した条件を満たしているかを確認
    vector_dimension INTEGER
);

-- IMAGES テーブル
CREATE TABLE IMAGES (
    image_id SERIAL PRIMARY KEY,
    image_data BYTEA, -- BYTEA: バイナリデータ型
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generation_prompt TEXT, -- TEXT: 可変長文字列型(文字数制限なし)
    prompt_embedding VECTOR(768) -- VECTOR: pgvector拡張機能で提供されるベクトル型
);

-- IMAGE_EMBEDDINGS テーブル
CREATE TABLE IMAGE_EMBEDDINGS (
    embedding_id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES IMAGES(image_id) ON DELETE CASCADE,
        -- IMAGESテーブルのimage_id列にあるimage_idのみ追加可能
        -- ON DELETE CASCADE: 参照先の行が削除された場合、参照元の行も削除
    model_id INTEGER REFERENCES EMBEDDING_MODELS(model_id) ON DELETE CASCADE,
    embedding VECTOR(768)
);

-- IMAGE_DESCRIPTOINS テーブル
CREATE TABLE IMAGE_DESCRIPTIONS (
    description_id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES IMAGES(image_id) ON DELETE CASCADE,
    description TEXT,
    embedding VECTOR(768)
);

-- pgvectorのHNSWインデックスを作成(近傍探索)
CREATE INDEX idx_image_embedding ON IMAGE_EMBEDDINGS USING hnsw(embedding vector_ip_ops);
CREATE INDEX idx_prompt_embedding ON IMAGES USING hnsw(prompt_embedding vector_ip_ops); 
CREATE INDEX idx_image_description_embedding ON IMAGE_DESCRIPTIONS USING hnsw(embedding vector_ip_ops);

-- 全文検索用の'tsvector'列を追加
ALTER TABLE IMAGES ADD COLUMN generation_prompt_tsv TSVECTOR;
ALTER TABLE IMAGE_DESCRIPTIONS ADD COLUMN description_tsv TSVECTOR;
    -- ALTER: テーブル定義の変更

-- 'tsvector'の値を'generation_prompt'から自動更新するトリガー
CREATE FUNCTION update_description_tsv() RETURNS TRIGGER AS $$
BEGIN
    NEW.description_tsv := to_tsvector('japanese', NEW.description);
        -- NEW: PostgreSQLのトリガー関数内で使用される特別なレコード変数
            -- INSERTまたはUPDATEが実行された際に、新しいレコードのデータを保持する
        -- :-: PL/pgSQLで変数に値を代入するための演算子
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_description_tsv
BEFORE INSERT OR UPDATE ON IMAGE_DESCRIPTIONS  
FOR EACH ROW
EXECUTE FUNCTION update_description_tsv();

-- GINインデックス作成(全文検索用)
CREATE INDEX idx_image_prompt ON IMAGES USING GIN(generation_prompt_tsv);
CREATE INDEX idx_image_description ON IMAGE_DESCRIPTIONS USING GIN(description_tsv);

-- 現在使用中のモデルを取得するビュー
CREATE VIEW CURRENT_EMBEDDING_MODEL AS
SELECT model_id, model_name, model_version, vector_dimension
FROM EMBEDDING_MODELS
WHERE is_current = 'Y';

-- 現在のモデルによるEmbeddingを取得するビュー
CREATE VIEW CURRENT_IMAGE_EMBEDDINGS AS
SELECT ie.embedding_id, ie.image_id, ie.embedding
FROM IMAGE_EMBEDDINGS ie
JOIN CURRENT_EMBEDDING_MODEL cem ON ie.model_id = cem.model_id;

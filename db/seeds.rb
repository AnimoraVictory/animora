# seeds.rb
require "active_record"
require "active_support"
require "active_support/test_case"      # FixtureSet を使うため
require "active_record/fixtures"
require "yaml"

# DB 接続設定（環境変数から読み込む）
ActiveRecord::Base.establish_connection(
  adapter:  "postgresql",
  host:     ENV.fetch("PG_HOST",     "localhost"),
  port:     ENV.fetch("PG_PORT",     5432),
  database: ENV.fetch("PG_DATABASE", "mydatabase"),
  username: ENV.fetch("PG_USER",     "myuser"),
  password: ENV.fetch("PG_PASSWORD", "mypass")
)

# fixtures フォルダ内の YAML を読み込んで投入
fixtures_dir  = File.expand_path("fixtures", __dir__)
fixture_files = Dir.children(fixtures_dir).grep(/\.yml\z/).map { |f| File.basename(f, ".yml") }

ActiveRecord::Base.transaction do
  ActiveRecord::FixtureSet.create_fixtures(fixtures_dir, fixture_files)
end

puts "seed完了"

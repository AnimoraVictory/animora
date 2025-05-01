.PHONY: lock freeze recommend

lock:
	uv lock

freeze:
	uv pip freeze | uv pip compile - -o requirements.txt

recommend:
	uv run -- uvicorn recommend_system.main:app --reload

setup:
	uv pip install -r requirements.txt --no-cache-dir
.PHONY: install

install:
	cargo install --path=oracle --locked
	cargo install --path=gateway --locked

run: install
	python3 ./test.py

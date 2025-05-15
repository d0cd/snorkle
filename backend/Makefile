.PHONY: install build

install:
	cargo install --path=oracle --locked
	cargo install --path=gateway --locked

build:
	cargo build --package=snorkle-oracle --locked
	cargo build --package=snorkle-gateway --locked

run: install
	python3 ./test.py

run-debug: build
	python3 ./test.py ./target/debug

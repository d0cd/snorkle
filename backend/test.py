#! /usr/bin/env python3

from time import sleep

from subprocess import Popen

oracle = Popen(["snorkle-oracle"])
sleep(2)
frontend = Popen(["snorkle-frontend"])

print("Waiting for Ctrl+C")
while True:
    try:
        sleep(10)
    except KeyboardInterrupt:
        print("Got Ctrl+C")
        break

frontend.kill()
oracle.kill()

frontend.wait()
oracle.wait()
print("Done")

#! /usr/bin/env python3

from time import sleep

from subprocess import Popen

from sys import argv

if len(argv) > 1:
    path = argv[1] + "/"
else:
    path = ""

oracle = Popen([path+"snorkle-oracle"])
sleep(2)
frontend = Popen([path+"snorkle-gateway"])

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

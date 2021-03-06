

import os
import subprocess
import time

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

client_address = "http://localhost:5000/vat.html?actor=client"
server_address = "http://localhost:5000/vat.html?actor=server&name=server"

print("client", os.getcwd())

def retry_until(until, retries=1000):
    r = -1
    while not until() and r < retries:
        if retries != 0:
            r += 1
        time.sleep(0.1)

def setup():
    if not os.path.exists("build"):
        os.mkdir("build")

    subprocess.call("webpack", shell=True)
    subprocess.call("cp src/*.html src/*.py src/*.gif build/", shell=True)

    subprocess.call("python3 src/runserver.py &", shell=True)
    retry_until(lambda: os.path.exists("server.pid"))
    print("Server started, running driver")

    options = webdriver.ChromeOptions()
    options.add_argument("--js-flags=--harmony")
    options.add_argument("--auto-open-devtools-for-tabs")
    driver = webdriver.Chrome(chrome_options=options)
    scr = "window.open('" + server_address + "')"
    print("scr", scr)
    time.sleep(0.5)
    driver.execute_script(scr)
    time.sleep(0.5)
    scr2 = "window.open('" + client_address + "')"
    driver.execute_script(scr2)

    driver.save_screenshot("screenshot.png")

    print("Loaded:", repr(driver.title), driver.current_url)
    print("--------")
    print(driver.page_source)
    print("--------")
    return driver

def quit(driver=None):
    if driver is not None:
        print("killing driver")
        driver.quit()

    if os.path.exists("server.pid"):
        print("killing server")
        with open("server.pid") as pid:
            cmd = "kill " + pid.read()
            subprocess.call(cmd, shell=True)

    retry_until(lambda: not os.path.exists("server.pid"))

def runforever():
    """Keep running as long as the server is alive.
    """
    print("waiting for server to die (press control-c to exit)")
    try:
        retry_until(lambda: not os.path.exists("server.pid"), 0)
    except KeyboardInterrupt:
        print("\nKeyboardInterrupt, exiting driver")
    quit(driver)

driver = None

try:
    driver = setup()
except KeyboardInterrupt:
    pass

if driver is not None:
    runforever()
else:
    quit()

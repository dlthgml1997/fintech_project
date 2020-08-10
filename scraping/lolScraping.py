# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.support.ui import Select

driver = webdriver.Chrome('./chromedriver')
driver.implicitly_wait(3)
driver.get(
    'http://luris.molit.go.kr/web/index.jsp')


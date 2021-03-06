# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.support.ui import Select

driver = webdriver.Chrome('./chromedriver')
driver.implicitly_wait(3)
driver.get(
    'http://luris.molit.go.kr/web/index.jsp')

element = Select(driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[1]/ul/li[1]/select'))
element2 = Select(driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[1]/ul/li[2]/select'))
element3 = Select(driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[1]/ul/li[3]/select'))
element4 = Select(driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[2]/ul/li[1]/select'))
element5 = driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[2]/ul/li[2]/input')
element6 = driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[2]/ul/li[4]/input')
button = driver.find_element_by_xpath('//*[@id="gnb_tab11"]/div/div[2]/div/div[3]/button')

element.select_by_visible_text('서울특별시')
driver.implicitly_wait(1)
element2.select_by_visible_text('강남구')
driver.implicitly_wait(1)
element3.select_by_visible_text('도곡동')
driver.implicitly_wait(1)
element4.select_by_visible_text('일반')
element5.send_keys('418')
element6.send_keys('10')
button.click()

data = driver.find_element_by_xpath('//*[@id="printData3"]/tbody/tr[2]/td')
print(data.text)

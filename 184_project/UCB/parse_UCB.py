from bs4 import BeautifulSoup
from requests import get
import re
from selenium import webdriver
import pandas as pd
import csv

options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options=options)

with open('UCB files.csv', mode = 'w', newline = '') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = ['num_people_enrolled', 'total_class_size', 'class_number', 'term'])
    writer.writeheader()

    url = 'https://classes.berkeley.edu/search/class/?f%5B0%5D=im_field_subject_area%3A483&f%5B1%5D=im_field_term_name%3A851&f%5B2%5D=im_field_term_name%3A831&f%5B3%5D=im_field_term_name%3A789&f%5B4%5D=im_field_term_name%3A770&f%5B5%5D=im_field_term_name%3A618&f%5B6%5D=im_field_term_name%3A582&f%5B7%5D=im_field_term_name%3A589'

    for i in range(0,35):
        if i >= 1:
            url = 'https://classes.berkeley.edu/search/class?page=' + str(i) +'&f%5B0%5D=im_field_subject_area%3A483&f%5B1%5D=im_field_term_name%3A851&f%5B2%5D=im_field_term_name%3A831&f%5B3%5D=im_field_term_name%3A789&f%5B4%5D=im_field_term_name%3A770&f%5B5%5D=im_field_term_name%3A618&f%5B6%5D=im_field_term_name%3A582&f%5B7%5D=im_field_term_name%3A589'
        driver.get(url)
        html = driver.page_source
        response = BeautifulSoup(html, 'lxml');
        each_body = response.find_all('div', {'class': 'result-wrapper'})
        for class_body in each_body:
            class_term = class_body.find('div', {'class': 'ls-term-year fmpbold'}).text
            class_name = class_body.find('span', {'class': 'ls-section-name'}).text
            class_page = class_body.find('a', {'class': 'ls-section-wrapper'})
            class_website = 'http://classes.berkeley.edu' + class_page.get('href')

            driver.get(class_website)
            class_html = driver.page_source

            this_class = BeautifulSoup(class_html, 'lxml')
            enrollment_detail = this_class.find('div', {'class': 'detail-class-enrollment-flex'})
            split = re.findall(r'[\w]+', enrollment_detail.text)

            enrolled = split[1]
            capacity = split[5]
            class_info = {
                'num_people_enrolled' : enrolled,
                'total_class_size' : capacity,
                'class_number' : class_name,
                'term' : class_term
            }
            writer.writerow(class_info)

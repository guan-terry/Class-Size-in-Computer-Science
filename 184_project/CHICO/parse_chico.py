from bs4 import BeautifulSoup
from requests import get
import re
from selenium import webdriver
import pandas as pd
import csv

with open('CHICO files.csv', mode = 'w', newline = '') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = ['num_people_enrolled', 'total_class_size', 'class_number', 'term','professor'])
    writer.writeheader()
    cs_types = ['CSCI', 'CINS']
    for cs_type in cs_types:
        for i in range(8,20):
            for term in range(0,2):
                season = 'spr'
                if term is 1:
                    season = 'fa'
                if i <= 9:
                    year = '200' + str(i)
                else:
                    year = '20' + str(i)
                url = 'http://ems.csuchico.edu/APSS/schedule/' + season + year +'/' + cs_type+'.shtml'
                #print(url)
                reponse = BeautifulSoup(get(url).text, 'lxml')
                class_block_1 = reponse.find_all('tr', {'class':'classrow'})
                class_block_2 = reponse.find_all('tr', {'class':'classrowalt'})
                class_block = class_block_1 + class_block_2
                for each_class_block in class_block:
                    class_name = each_class_block.find('td', {'class':'cat_num'}).text
                    capacity = each_class_block.find('td', {'class':'enrtot'}).text
                    enrolled = each_class_block.find('td', {'class':'seatsavail'}).text
                    professor = each_class_block.find('td', {'class':'Instructor'}).text
                    #print(professor)

                    class_type = each_class_block.find('td', {'class':'comp'}).text
                    if class_type is not 'ACT':
                        class_info = {
                            'num_people_enrolled' : enrolled,
                            'total_class_size': capacity,
                            'class_number': class_name,
                            'term': season+year,
                            'professor':professor
                        }
                        writer.writerow(class_info)

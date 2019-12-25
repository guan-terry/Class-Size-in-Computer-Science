from bs4 import BeautifulSoup
from requests import get
import re
from selenium import webdriver
import pandas as pd
import csv

with open('SDSU files.csv', mode = 'w', newline = '') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = ['num_people_enrolled', 'total_class_size', 'class_number', 'term', 'professor'])
    writer.writeheader()

    for i in range(9, 20):
        for term in range(2,5,2):
            season = ' Fall'
            if term == 4:
                season = " Spring"
            combined_temr = str(i) + season
            url = 'https://sunspot.sdsu.edu/schedule/search?mode=search&period=20'+str(i) + str(term)+'&admin_unit=R&abbrev=CS&number=&suffix=&courseTitle=&scheduleNumber=&units=&instructor=&facility=&space=&meetingType=&startHours=&startMins=&endHours=&endMins=&remaining_seats_at_least='

            if i == 9:
                url = 'https://sunspot.sdsu.edu/schedule/search?mode=search&period=2009' + str(term) + '&admin_unit=R&abbrev=CS&number=&suffix=&courseTitle=&scheduleNumber=&units=&instructor=&facility=&space=&meetingType=&startHours=&startMins=&endHours=&endMins=&remaining_seats_at_least='
            response = BeautifulSoup(get(url).text, 'lxml')
            classes = response.find_all('div', {'class':'sectionMeeting'})
            for class_block in classes:
                seats = class_block.find('div',{'class':'sectionFieldSeats'})
                if seats is not None:
                    professor = class_block.find('div', {'class':'sectionFieldInstructor column'}).a
                    professor_name = None;
                    if professor is not None:
                        professor_name = professor.text
                    seats = seats.text.strip()
                    class_name = class_block.find('div', {'class':'sectionFieldCourse column'}).text
                    type = class_block.find('div', {'class':'sectionFieldType column'}).text
                    if type == 'Lecture' or type == 'Seminar':
                        enrolled_cap = seats.split('/')
                        class_info = {
                            'num_people_enrolled' : enrolled_cap[0],
                            'total_class_size' : enrolled_cap[1],
                            'class_number' : class_name.strip(),
                            'term' : combined_temr,
                            'professor': professor_name
                        }
                        writer.writerow(class_info)

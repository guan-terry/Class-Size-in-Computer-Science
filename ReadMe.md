The pdf file is just the PDF for all the IPYNB files if the user does not have a python notebook installed.

Running:
Step 1:
To get the data, first run preinstall.ipynb , then run parse_(schoolname).ipynb in the school folderwhich will be in 
a school names' folder to scrape each website for a raw csv files. Some scrapers may take a long time to run. 

Step 2:
Next run each of the 3 files: (data_classsize.ipynb , data_lowerupper.ipynb , data_subjects.ipynb)
Each will have the same block of code in the beginning to clean up the noisy data in the csv files we had
scraped and make a dataframe out of it. At the end, each file will also have visualizations of the questions
being answered.
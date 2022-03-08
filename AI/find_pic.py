import os
import re
import json
import random
from PIL import Image

for filepath,dirnames,filenames in os.walk(r'./images/bored_apes'):
    
    for filename in filenames:
        # Just get the image file
        if filename.endswith(('jpg','png','jpeg','bmp','JPG','PNG','JPEG','BMP')):
            #print(filepath+'/'+filename)
            img = Image.open(filepath+'/'+filename)
            if len(img.getbands())>3:
                print(filename)
                print(img.getbands())
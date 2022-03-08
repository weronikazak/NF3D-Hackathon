import PIL
import os
import os.path
from PIL import Image

img_dir = os.getcwd() + "//images//bored_apes//"

print('Bulk images resizing started...')

for img in os.listdir(img_dir):
	f_img = img_dir + img
	f, e = os.path.splitext(img_dir + img)
	img = Image.open(f_img)
	img = img.convert('RGB')
	img = img.resize((150, 150))
	img.save(f + '.jpg')

print('Bulk images resizing finished...')
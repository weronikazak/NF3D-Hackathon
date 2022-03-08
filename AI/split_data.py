import argparse
import csv
import os

import numpy as np
from PIL import Image
from tqdm import tqdm


def save_csv(data, path, fieldnames=['image_path', 
                                    'Background', 
                                    'Clothes', 
                                    'Earring', 
                                    'Eyes', 
                                    'Fur', 
                                    'Hat', 
                                    'Mouth']):
    with open(path, 'w', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(dict(zip(fieldnames, row)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Split data for the dataset')
    parser.add_argument('--input', type=str, required=True, help="Path to the dataset")
    parser.add_argument('--output', type=str, required=True, help="Path to the working folder")

    args = parser.parse_args()
    input_folder = args.input
    output_folder = args.output
    annotation = os.path.join(input_folder, 'apes_updated.csv')

    # open annotation file
    all_data = []
    with open(annotation) as csv_file:
        # parse it as CSV
        reader = csv.DictReader(csv_file)
        # tqdm shows pretty progress bar
        # each row in the CSV file corresponds to the image
        for row in tqdm(reader, total=reader.line_num):
            try:
                # we need image ID to build the path to the image file
                img_id = row['image_id']
                # we're going to use only 3 attributes
                background = row['Background']
                clothes = row['Clothes']
                earring = row['Earring']
                eyes = row['Eyes']
                fur = row['Fur']
                hat = row['Hat']
                mouth = row['Mouth']

                img_name = os.path.join('images/bored_apes', str(img_id) + '.jpg')
                # check if file is in place
                if os.path.exists(img_name):
                    # img = Image.open(img_name)
                    all_data.append([img_name,
                                    background,
                                    clothes,
                                    earring,
                                    eyes,
                                    fur,
                                    hat,
                                    mouth])
            except:
                pass

    # set the seed of the random numbers generator, so we can reproduce the results later
    np.random.seed(42)
    # construct a Numpy array from the list
    all_data = np.asarray(all_data)
    # Take 40000 samples in random order
    data_size = len(all_data)
    inds = np.random.choice(data_size, data_size, replace=False)
    # split the data into train/val and save them as csv files
    save_csv(all_data[inds][:int(data_size*0.8)], os.path.join(output_folder, 'apes_train.csv'))
    save_csv(all_data[inds][int(data_size*0.8):data_size], os.path.join(output_folder, 'apes_val.csv'))
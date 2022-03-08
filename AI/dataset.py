import csv

import numpy as np
from PIL import Image
from torch.utils.data import Dataset

mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]


class AttributesDataset():
    def __init__(self, annotation_path):
        background_labels = []
        clothes_labels = []
        earring_labels = []
        eyes_labels = []
        fur_labels = []
        hat_labels = []
        mouth_labels = []

        with open(annotation_path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                background_labels.append(row['Background'])
                clothes_labels.append(row['Clothes'])
                earring_labels.append(row['Earring'])
                eyes_labels.append(row['Eyes'])
                fur_labels.append(row['Fur'])
                hat_labels.append(row['Hat'])
                mouth_labels.append(row['Mouth'])

        self.background_labels = np.unique(background_labels)
        self.clothes_labels = np.unique(clothes_labels)
        self.earring_labels = np.unique(earring_labels)
        self.eyes_labels = np.unique(eyes_labels)
        self.fur_labels = np.unique(fur_labels)
        self.hat_labels = np.unique(hat_labels)
        self.mouth_labels = np.unique(mouth_labels)

        self.num_backgrounds = len(self.background_labels)
        self.num_clothes = len(self.clothes_labels)
        self.num_earrings = len(self.earring_labels)
        self.num_eyes = len(self.eyes_labels)
        self.num_furs = len(self.fur_labels)
        self.num_hats = len(self.hat_labels)
        self.num_mouths = len(self.mouth_labels)

        self.background_id_to_name = dict(zip(range(len(self.background_labels)), self.background_labels))
        self.background_name_to_id = dict(zip(self.background_labels, range(len(self.background_labels))))

        self.cloth_id_to_name = dict(zip(range(len(self.clothes_labels)), self.clothes_labels))
        self.cloth_name_to_id = dict(zip(self.clothes_labels, range(len(self.clothes_labels))))

        self.earring_id_to_name = dict(zip(range(len(self.earring_labels)), self.earring_labels))
        self.earring_name_to_id = dict(zip(self.earring_labels, range(len(self.earring_labels))))

        self.eye_id_to_name = dict(zip(range(len(self.eyes_labels)), self.eyes_labels))
        self.eye_name_to_id = dict(zip(self.eyes_labels, range(len(self.eyes_labels))))

        self.fur_id_to_name = dict(zip(range(len(self.fur_labels)), self.fur_labels))
        self.fur_name_to_id = dict(zip(self.fur_labels, range(len(self.fur_labels))))

        self.hat_id_to_name = dict(zip(range(len(self.hat_labels)), self.hat_labels))
        self.hat_name_to_id = dict(zip(self.hat_labels, range(len(self.hat_labels))))

        self.mouth_id_to_name = dict(zip(range(len(self.mouth_labels)), self.mouth_labels))
        self.mouth_name_to_id = dict(zip(self.mouth_labels, range(len(self.mouth_labels))))


class ApesDataset(Dataset):
    def __init__(self, annotation_path, attributes, transform=None):
        super().__init__()

        self.transform = transform
        self.attr = attributes

        # initialize the arrays to store the ground truth labels and paths to the images

        self.data = []
        self.background_labels = []
        self.clothes_labels = []
        self.earring_labels = []
        self.eyes_labels = []
        self.fur_labels = []
        self.hat_labels = []
        self.mouth_labels = []


        # read the annotations from the CSV file
        with open(annotation_path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.data.append(row['image_path'])
                self.background_labels.append(self.attr.background_name_to_id[row['Background']])
                self.clothes_labels.append(self.attr.cloth_name_to_id[row['Clothes']])
                self.earring_labels.append(self.attr.earring_name_to_id[row['Earring']])
                self.eyes_labels.append(self.attr.eye_name_to_id[row['Eyes']])
                self.fur_labels.append(self.attr.fur_name_to_id[row['Fur']])
                self.hat_labels.append(self.attr.hat_name_to_id[row['Hat']])
                self.mouth_labels.append(self.attr.mouth_name_to_id[row['Mouth']])

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        # take the data sample by its index
        img_path = self.data[idx]

        # read image
        img = Image.open(img_path)
        # img = img.resize((150, 150))
        # img = img.convert('RGB')
        # img.save(img_path)
        # img = Image.open(img_path)

        # apply the image augmentations if needed
        if self.transform:
            img = self.transform(img)

        # return the image and all the associated labels
        dict_data = {
            'img': img,
            'labels': {
                'background_labels': self.background_labels[idx],
                'clothes_labels': self.clothes_labels[idx],
                'earring_labels': self.earring_labels[idx],
                'eyes_labels': self.eyes_labels[idx],
                'fur_labels': self.fur_labels[idx],
                'hat_labels': self.hat_labels[idx],
                'mouth_labels': self.mouth_labels[idx]
            }
        }
        return dict_data
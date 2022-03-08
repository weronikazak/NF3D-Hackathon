import argparse
import os
from datetime import datetime

import torch
import torchvision.transforms as transforms
from dataset import ApesDataset, AttributesDataset, mean, std
from model import MultiOutputModel
from test import calculate_metrics, validate, visualize_grid
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter


def get_cur_time():
    return datetime.strftime(datetime.now(), '%Y-%m-%d_%H-%M')


def checkpoint_save(model, name, epoch):
    f = os.path.join(name, 'checkpoint-{:06d}.pth'.format(epoch))
    torch.save(model.state_dict(), f)
    print('Saved checkpoint:', f)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Training pipeline')
    parser.add_argument('--attributes_file', type=str, default='./apes_pivoted.csv',
                        help="Path to the file with attributes")
    parser.add_argument('--device', type=str, default='cuda', help="Device: 'cuda' or 'cpu'")
    args = parser.parse_args()

    start_epoch = 1
    N_epochs = 50
    batch_size = 16
    num_workers = 8  # number of processes to handle dataset loading
    device = torch.device("cuda" if torch.cuda.is_available() and args.device == 'cuda' else "cpu")

    # attributes variable contains labels for the categories in the dataset and mapping between string names and IDs
    attributes = AttributesDataset(args.attributes_file)

    # specify image transforms for augmentation during training
    train_transform = transforms.Compose([
        # transforms.RandomHorizontalFlip(p=0.5),
        # transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0),
        # transforms.RandomAffine(degrees=20, translate=(0.1, 0.1), scale=(0.8, 1.2),
                                # shear=None, resample=False, fillcolor=(255, 255, 255)),
        # transforms.ToPILImage(),        
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

    # during validation we use only tensor and normalization transforms
    val_transform = transforms.Compose([
        # transforms.ToPILImage(),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

    train_dataset = ApesDataset('./data/apes_train.csv', attributes, train_transform)
    train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)

    val_dataset = ApesDataset('./data/apes_val.csv', attributes, val_transform)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    model = MultiOutputModel(n_background_classes=attributes.num_backgrounds,
                             n_clothes_classes=attributes.num_clothes,
                             n_earring_classes=attributes.num_earrings,
                             n_eyes_classes=attributes.num_eyes,
                             n_fur_classes=attributes.num_furs,
                             n_hat_classes=attributes.num_hats,
                             n_mouth_classes=attributes.num_mouths)\
                            .to(device)

    optimizer = torch.optim.Adam(model.parameters())

    logdir = os.path.join('./logs/', get_cur_time())
    savedir = os.path.join('./checkpoints/', get_cur_time())
    os.makedirs(logdir, exist_ok=True)
    os.makedirs(savedir, exist_ok=True)
    logger = SummaryWriter(logdir)

    n_train_samples = len(train_dataloader)

    # Uncomment rows below to see example images with ground truth labels in val dataset and all the labels:
    # visualize_grid(model, val_dataloader, attributes, device, show_cn_matrices=False, show_images=True,
    #                checkpoint=None, show_gt=True)
    # print("\nAll background labels:\n", attributes.background_labels)
    # print("\nAll clothes labels:\n", attributes.clothes_labels)
    # print("\nAll earring labels:\n", attributes.earring_labels)
    # print("\nAll eyes labels:\n", attributes.eyes_labels)
    # print("\nAll fur labels:\n", attributes.fur_labels)
    # print("\nAll hat labels:\n", attributes.hat_labels)
    # print("\nAll mouth labels:\n", attributes.mouth_labels)

    print("Starting training ...")

    for epoch in range(start_epoch, N_epochs + 1):
        total_loss = 0
        accuracy_background = 0
        accuracy_clothes = 0
        accuracy_earring = 0
        accuracy_eyes = 0
        accuracy_fur = 0
        accuracy_hat = 0
        accuracy_mouth = 0

        for batch in train_dataloader:
            optimizer.zero_grad()

            img = batch['img']
            target_labels = batch['labels']
            target_labels = {t: target_labels[t].to(device) for t in target_labels}
            output = model(img.to(device))

            loss_train, losses_train = model.get_loss(output, target_labels)
            total_loss += loss_train.item()
            batch_accuracy_background, batch_accuracy_clothes, batch_accuracy_earring, batch_accuracy_eyes, batch_accuracy_fur, batch_accuracy_hat, batch_accuracy_mouth = \
                calculate_metrics(output, target_labels)

            accuracy_background += batch_accuracy_background
            accuracy_clothes += batch_accuracy_clothes
            accuracy_earring += batch_accuracy_earring
            accuracy_eyes += batch_accuracy_eyes
            accuracy_fur += batch_accuracy_fur
            accuracy_hat += batch_accuracy_hat
            accuracy_mouth += batch_accuracy_mouth

            loss_train.backward()
            optimizer.step()

        print("epoch {:4d}, loss: {:.4f}, background: {:.4f}, clothes: {:.4f}, earring: {:.4f}, eyes: {:.4f}, fur: {:.4f}, hat: {:.4f}, mouth: {:.4f}".format(
            epoch,
            total_loss / n_train_samples,
            accuracy_background / n_train_samples,
            accuracy_clothes / n_train_samples,
            accuracy_earring / n_train_samples,
            accuracy_eyes / n_train_samples,
            accuracy_fur / n_train_samples,
            accuracy_hat / n_train_samples,
            accuracy_mouth / n_train_samples))

        logger.add_scalar('train_loss', total_loss / n_train_samples, epoch)

        if epoch % 5 == 0:
            validate(model, val_dataloader, logger, epoch, device)

        if epoch % 25 == 0:
            checkpoint_save(model, savedir, epoch)
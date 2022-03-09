import argparse
import os
import warnings

import matplotlib.pyplot as plt
import numpy as np
import torch
import torchvision.transforms as transforms
from dataset import ApesDataset, AttributesDataset, mean, std
from model import MultiOutputModel
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, balanced_accuracy_score
from torch.utils.data import DataLoader


def checkpoint_load(model, name):
    print('Restoring checkpoint: {}'.format(name))
    model.load_state_dict(torch.load(name, map_location='cpu'))
    epoch = int(os.path.splitext(os.path.basename(name))[0].split('-')[1])
    return epoch


def validate(model, dataloader, logger, iteration, device, checkpoint=None):
    if checkpoint is not None:
        checkpoint_load(model, checkpoint)

    model.eval()
    with torch.no_grad():
        avg_loss = 0
        accuracy_background = 0
        accuracy_clothes = 0
        accuracy_earring = 0
        accuracy_eyes = 0
        accuracy_fur = 0
        accuracy_hat = 0
        accuracy_mouth = 0

        for batch in dataloader:
            img = batch['img']
            target_labels = batch['labels']
            target_labels = {t: target_labels[t].to(device) for t in target_labels}
            output = model(img.to(device))

            val_train, val_train_losses = model.get_loss(output, target_labels)
            avg_loss += val_train.item()
            batch_accuracy_background, batch_accuracy_clothes, batch_accuracy_earring, batch_accuracy_eyes, batch_accuracy_fur, batch_accuracy_hat, batch_accuracy_mouth = \
                calculate_metrics(output, target_labels)

            accuracy_background += batch_accuracy_background
            accuracy_clothes += batch_accuracy_clothes
            accuracy_earring += batch_accuracy_earring
            accuracy_eyes += batch_accuracy_eyes
            accuracy_fur += batch_accuracy_fur
            accuracy_hat += batch_accuracy_hat
            accuracy_mouth += batch_accuracy_mouth

    n_samples = len(dataloader)
    avg_loss /= n_samples
    accuracy_background / n_samples,
    accuracy_clothes / n_samples,
    accuracy_earring / n_samples,
    accuracy_eyes / n_samples,
    accuracy_fur / n_samples,
    accuracy_hat / n_samples,
    accuracy_mouth / n_samples
    print('-' * 72)
    print("Validation  loss: {:.4f},  background: {:.4f}, clothes: {:.4f}, earring: {:.4f}, eyes: {:.4f}, fur: {:.4f}, hat: {:.4f}, mouth: {:.4f}\n".format(
        avg_loss, accuracy_background, accuracy_clothes, 
        accuracy_earring, accuracy_eyes, accuracy_fur, 
        accuracy_hat, accuracy_mouth))

    logger.add_scalar('val_loss', avg_loss, iteration)
    logger.add_scalar('val_accuracy_background', accuracy_background, iteration)
    logger.add_scalar('val_accuracy_clothes', accuracy_clothes, iteration)
    logger.add_scalar('val_accuracy_earring', accuracy_earring, iteration)
    logger.add_scalar('val_accuracy_eyes', accuracy_eyes, iteration)
    logger.add_scalar('val_accuracy_fur', accuracy_fur, iteration)
    logger.add_scalar('val_accuracy_hat', accuracy_hat, iteration)
    logger.add_scalar('val_accuracy_mouth', accuracy_mouth, iteration)

    model.train()


def visualize_grid(model, dataloader, attributes, device, show_cn_matrices=True, show_images=True, checkpoint=None,
                   show_gt=False):
    if checkpoint is not None:
        checkpoint_load(model, checkpoint)
    model.eval()

    imgs = []
    labels = []
    gt_labels = []

    gt_background_all = []
    gt_clothes_all = []
    gt_earring_all = []
    gt_eyes_all = []
    gt_fur_all = []
    gt_hat_all = []
    gt_mouth_all = []

    predicted_background_all = []
    predicted_clothes_all = []
    predicted_earring_all = []
    predicted_eyes_all = []
    predicted_fur_all = []
    predicted_hat_all = []
    predicted_mouth_all = []

    accuracy_background = 0
    accuracy_clothes = 0
    accuracy_earring = 0
    accuracy_eyes = 0
    accuracy_fur = 0
    accuracy_hat = 0
    accuracy_mouth = 0

    with torch.no_grad():
        for batch in dataloader:
            img = batch['img']
            gt_backgrounds = batch['labels']['background_labels']
            gt_clothes = batch['labels']['clothes_labels']
            gt_earrings = batch['labels']['earring_labels']
            gt_eyes = batch['labels']['eyes_labels']
            gt_furs = batch['labels']['fur_labels']
            gt_hats = batch['labels']['hat_labels']
            gt_mouths = batch['labels']['mouth_labels']
            output = model(img.to(device))

            batch_accuracy_background, batch_accuracy_clothes, batch_accuracy_earring, batch_accuracy_eyes, batch_accuracy_fur, batch_accuracy_hat, batch_accuracy_mouth = \
                calculate_metrics(output, batch['labels'])
            
            accuracy_background += batch_accuracy_background
            accuracy_clothes += batch_accuracy_clothes
            accuracy_earring += batch_accuracy_earring
            accuracy_eyes += batch_accuracy_eyes
            accuracy_fur += batch_accuracy_fur
            accuracy_hat += batch_accuracy_hat
            accuracy_mouth += batch_accuracy_mouth

            # get the most confident prediction for each image
            _, predicted_backgrounds = output['background'].cpu().max(1)
            _, predicted_clothes = output['clothes'].cpu().max(1)
            _, predicted_earrings = output['earring'].cpu().max(1)
            _, predicted_eyes = output['eyes'].cpu().max(1)
            _, predicted_furs = output['fur'].cpu().max(1)
            _, predicted_hats = output['hat'].cpu().max(1)
            _, predicted_mouths = output['mouth'].cpu().max(1)

            for i in range(img.shape[0]):
                image = np.clip(img[i].permute(1, 2, 0).numpy() * std + mean, 0, 1)

                predicted_background = attributes.background_id_to_name[predicted_backgrounds[i].item()]
                predicted_cloth = attributes.cloth_id_to_name[predicted_clothes[i].item()]
                predicted_earring = attributes.earring_id_to_name[predicted_earrings[i].item()]
                predicted_eye = attributes.eye_id_to_name[predicted_eyes[i].item()]
                predicted_fur = attributes.fur_id_to_name[predicted_furs[i].item()]
                predicted_hat = attributes.hat_id_to_name[predicted_hats[i].item()]
                predicted_mouth = attributes.mouth_id_to_name[predicted_mouths[i].item()]

                gt_background = attributes.background_id_to_name[gt_backgrounds[i].item()]
                gt_cloth = attributes.cloth_id_to_name[gt_clothes[i].item()]
                gt_earring = attributes.earring_id_to_name[gt_earrings[i].item()]
                gt_eye = attributes.eye_id_to_name[gt_eyes[i].item()]
                gt_fur = attributes.fur_id_to_name[gt_furs[i].item()]
                gt_hat = attributes.hat_id_to_name[gt_hats[i].item()]
                gt_mouth = attributes.mouth_id_to_name[gt_mouths[i].item()]

                gt_background_all.append(gt_backgrounds)
                gt_clothes_all.append(gt_cloth)
                gt_earring_all.append(gt_earring)
                gt_eyes_all.append(gt_eye)
                gt_fur_all.append(gt_fur)
                gt_hat_all.append(gt_hat)
                gt_mouth_all.append(gt_mouth)

                predicted_background_all.append(predicted_background)
                predicted_clothes_all.append(predicted_cloth)
                predicted_earring_all.append(predicted_earring)
                predicted_eyes_all.append(predicted_eye)
                predicted_fur_all.append(predicted_fur)
                predicted_hat_all.append(predicted_hat)
                predicted_mouth_all.append(predicted_mouth)

                imgs.append(image)
                labels.append("{}\n{}\n{}\n{}\n{}\n{}\n{}".format(predicted_background, predicted_cloth, predicted_earring,
                                                                        predicted_eye, predicted_fur, predicted_hat, predicted_mouth))
                gt_labels.append("{}\n{}\n{}\n{}\n{}\n{}\n{}".format(gt_background, gt_cloth, gt_earring, gt_eye, gt_fur, gt_hat, gt_mouth))

    if not show_gt:
        n_samples = len(dataloader)
        print("\nAccuracy:\nbackground: {:.4f}, clothes: {:.4f}, earring: {:.4f}, eyes: {:.4f}, fur: {:.4f}, hat: {:.4f}, mouth: {:.4f}".format(
            accuracy_background / n_samples,
            accuracy_clothes / n_samples,
            accuracy_earring / n_samples,
            accuracy_eyes / n_samples,
            accuracy_fur / n_samples,
            accuracy_hat / n_samples,
            accuracy_mouth / n_samples))

    # Draw confusion matrices
    # if show_cn_matrices:
        # Background
        # cn_matrix = confusion_matrix(
        #     y_true=gt_background_all,
        #     y_pred=predicted_background_all,
        #     labels=attributes.background_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.background_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Background")
        # plt.show()

        # # Clothes
        # cn_matrix = confusion_matrix(
        #     y_true=gt_clothes_all,
        #     y_pred=predicted_clothes_all,
        #     labels=attributes.clothes_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.clothes_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Clothes")
        # plt.show()

        # # Earring
        # cn_matrix = confusion_matrix(
        #     y_true=gt_earring_all,
        #     y_pred=predicted_earring_all,
        #     labels=attributes.earring_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.earring_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Earring")
        # plt.show()

        # # Eyes
        # cn_matrix = confusion_matrix(
        #     y_true=gt_eyes_all,
        #     y_pred=predicted_eyes_all,
        #     labels=attributes.eyes_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.eyes_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Eyes")
        # plt.show()

        # # Fur
        # cn_matrix = confusion_matrix(
        #     y_true=gt_fur_all,
        #     y_pred=predicted_fur_all,
        #     labels=attributes.fur_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.fur_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Fur")
        # plt.show()

        # # Hat
        # cn_matrix = confusion_matrix(
        #     y_true=gt_hat_all,
        #     y_pred=predicted_hat_all,
        #     labels=attributes.hat_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.hat_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Hat")
        # plt.show()

        # Mouth
        # cn_matrix = confusion_matrix(
        #     y_true=gt_mouth_all,
        #     y_pred=predicted_mouth_all,
        #     labels=attributes.mouth_labels,
        #     normalize='true')
        # plt.rcParams.update({'font.size': 1.8})
        # plt.rcParams.update({'figure.dpi': 300})
        # ConfusionMatrixDisplay(cn_matrix, attributes.mouth_labels).plot(
        #     include_values=False, xticks_rotation='vertical')
        # plt.rcParams.update({'figure.dpi': 100})
        # plt.rcParams.update({'font.size': 5})
        # plt.title("Mouth")
        # plt.show()
        

    if show_images:
        labels = gt_labels if show_gt else labels
        title = "Ground truth labels" if show_gt else "Predicted labels"
        n_cols = 3
        n_rows = 3
        fig, axs = plt.subplots(n_rows, n_cols, figsize=(10, 10))
        axs = axs.flatten()
        for img, ax, label in zip(imgs, axs, labels):
            ax.set_xlabel(label, rotation=0)
            ax.get_xaxis().set_ticks([])
            ax.get_yaxis().set_ticks([])
            ax.imshow(img)
        plt.suptitle(title)
        plt.tight_layout()
        plt.show()

    model.train()
    torch.save(model.state_dict(), checkpoint)


def calculate_metrics(output, target):
    _, predicted_background = output['background'].cpu().max(1)
    gt_background = target['background_labels'].cpu()

    _, predicted_cloth = output['clothes'].cpu().max(1)
    gt_cloth = target['clothes_labels'].cpu()

    _, predicted_earring = output['earring'].cpu().max(1)
    gt_earring = target['earring_labels'].cpu()

    _, predicted_eye = output['eyes'].cpu().max(1)
    gt_eye = target['eyes_labels'].cpu()

    _, predicted_fur = output['fur'].cpu().max(1)
    gt_fur = target['fur_labels'].cpu()

    _, predicted_hat = output['hat'].cpu().max(1)
    gt_hat = target['hat_labels'].cpu()

    _, predicted_mouth = output['mouth'].cpu().max(1)
    gt_mouth = target['mouth_labels'].cpu()

    with warnings.catch_warnings():  # sklearn may produce a warning when processing zero row in confusion matrix
        warnings.simplefilter("ignore")
        accuracy_background = balanced_accuracy_score(y_true=gt_background.numpy(), y_pred=predicted_background.numpy())
        accuracy_clothes = balanced_accuracy_score(y_true=gt_cloth.numpy(), y_pred=predicted_cloth.numpy())
        accuracy_earring = balanced_accuracy_score(y_true=gt_earring.numpy(), y_pred=predicted_earring.numpy())
        accuracy_eye = balanced_accuracy_score(y_true=gt_eye.numpy(), y_pred=predicted_eye.numpy())
        accuracy_fur = balanced_accuracy_score(y_true=gt_fur.numpy(), y_pred=predicted_fur.numpy())
        accuracy_hat = balanced_accuracy_score(y_true=gt_hat.numpy(), y_pred=predicted_hat.numpy())
        accuracy_mouth = balanced_accuracy_score(y_true=gt_mouth.numpy(), y_pred=predicted_mouth.numpy())

    return accuracy_background, accuracy_clothes, accuracy_earring, accuracy_eye, accuracy_fur, accuracy_hat, accuracy_mouth


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Inference pipeline')
    parser.add_argument('--checkpoint', type=str, required=True, help="Path to the checkpoint")
    parser.add_argument('--attributes_file', type=str, default='./apes_pivoted.csv',
                        help="Path to the file with attributes")
    parser.add_argument('--device', type=str, default='cuda',
                        help="Device: 'cuda' or 'cpu'")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() and args.device == 'cuda' else "cpu")
    # attributes variable contains labels for the categories in the dataset and mapping between string names and IDs
    attributes = AttributesDataset(args.attributes_file)

    # during validation we use only tensor and normalization transforms
    val_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

    test_dataset = ApesDataset('./data/apes_val.csv', attributes, val_transform)
    test_dataloader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=4)

    model = MultiOutputModel(n_background_classes=attributes.num_backgrounds,
                             n_clothes_classes=attributes.num_clothes,
                             n_earring_classes=attributes.num_earrings,
                             n_eyes_classes=attributes.num_eyes,
                             n_fur_classes=attributes.num_furs,
                             n_hat_classes=attributes.num_hats,
                             n_mouth_classes=attributes.num_mouths).to(device)

    # Visualization of the trained model
    visualize_grid(model, test_dataloader, attributes, device, checkpoint=args.checkpoint)
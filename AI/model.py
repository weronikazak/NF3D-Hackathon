import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models


class MultiOutputModel(nn.Module):
    def __init__(self, n_background_classes, n_clothes_classes, n_earring_classes,
                    n_eyes_classes, n_fur_classes, n_hat_classes, n_mouth_classes):
        super().__init__()
        self.base_model = models.mobilenet_v2().features  # take the model without classifier
        last_channel = models.mobilenet_v2().last_channel  # size of the layer before classifier

        # the input for the classifier should be two-dimensional, but we will have
        # [batch_size, channels, width, height]
        # so, let's do the spatial averaging: reduce width and height to 1
        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        # create separate classifiers for our outputs
        self.background = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_background_classes)
        )
        self.clothes = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_clothes_classes)
        )
        self.earring = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_earring_classes)
        )
        self.eyes = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_eyes_classes)
        )
        self.fur = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_fur_classes)
        )
        self.hat = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_hat_classes)
        )
        self.mouth = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features=last_channel, out_features=n_mouth_classes)
        )

    def forward(self, x):
        x = self.base_model(x)
        x = self.pool(x)

        # reshape from [batch, channels, 1, 1] to [batch, channels] to put it into classifier
        x = torch.flatten(x, 1)

        return {
            'background': self.background(x),
            'clothes': self.clothes(x),
            'earring': self.earring(x),
            'eyes': self.eyes(x),
            'fur': self.fur(x),
            'hat': self.hat(x),
            'mouth': self.mouth(x)
        }

    def get_loss(self, net_output, ground_truth):
        background_loss = F.cross_entropy(net_output['background'], ground_truth['background_labels'])
        clothes_loss = F.cross_entropy(net_output['clothes'], ground_truth['clothes_labels'])
        earrings_loss = F.cross_entropy(net_output['earring'], ground_truth['earring_labels'])
        eyes_loss = F.cross_entropy(net_output['eyes'], ground_truth['eyes_labels'])
        fur_loss = F.cross_entropy(net_output['fur'], ground_truth['fur_labels'])
        hat_loss = F.cross_entropy(net_output['hat'], ground_truth['hat_labels'])
        mouth_loss = F.cross_entropy(net_output['mouth'], ground_truth['mouth_labels'])
        
        loss = background_loss + clothes_loss + earrings_loss + eyes_loss + fur_loss + hat_loss + mouth_loss
        return loss, {
                'background': background_loss, 
                'clothes': clothes_loss, 
                'earring': earrings_loss, 
                'eyes': eyes_loss, 
                'fur': fur_loss, 
                'hat': hat_loss,
                'mouth': mouth_loss
        }
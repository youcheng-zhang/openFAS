import postures

class posture_classifier(object):

    def __init__(self) -> None:
        pass
    
    def add(self, classifier, posture):
        if posture == postures.R_TOUCH_EAR:
            self.R_TOUCH_EAR = classifier
        elif posture == postures.L_TOUCH_EAR:
            self.L_TOUCH_EAR = classifier
        elif posture == postures.R_TOUCH_KNEE:
            self.R_TOUCH_KNEE = classifier
        elif posture == postures.L_TOUCH_KNEE:
            self.L_TOUCH_KNEE = classifier
        elif posture == postures.R_TOUCH_BACK:
            self.R_TOUCH_BACK = classifier
        elif posture == postures.L_TOUCH_BACK:
            self.L_TOUCH_BACK = classifier
        elif posture == postures.R_RAISE_HAND:
            self.R_RAISE_HAND = classifier
        elif posture == postures.L_RAISE_HAND:
            self.L_RAISE_HAND = classifier
        else:
            print("Can't add the classifier")

    def get_classifier(self, posture):
        try:
            if posture == postures.R_TOUCH_EAR:
                return self.R_TOUCH_EAR
            elif posture == postures.L_TOUCH_EAR:
                return self.L_TOUCH_EAR
            elif posture == postures.R_TOUCH_KNEE:
                return self.R_TOUCH_KNEE
            elif posture == postures.L_TOUCH_KNEE:
                return self.L_TOUCH_KNEE
            elif posture == postures.R_TOUCH_BACK:
                return self.R_TOUCH_BACK
            elif posture == postures.L_TOUCH_BACK:
                return self.L_TOUCH_BACK
            elif posture == postures.R_RAISE_HAND:
                return self.R_RAISE_HAND
            elif posture == postures.L_RAISE_HAND:
                return self.L_RAISE_HAND
        except:
            print("Can't get the classifier")
            return None
            
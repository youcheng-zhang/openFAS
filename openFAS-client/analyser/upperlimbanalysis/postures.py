UNKNOWN = 0
R_TOUCH_EAR = 1
L_TOUCH_EAR = 2
R_TOUCH_KNEE = 3
L_TOUCH_KNEE = 4
R_TOUCH_BACK = 5
L_TOUCH_BACK = 6
R_RAISE_HAND = 7
L_RAISE_HAND = 8

def get_posture_name_by_index(index):
    if index == R_TOUCH_EAR: return "R_TOUCH_EAR"
    elif index == L_TOUCH_EAR: return "L_TOUCH_EAR"
    elif index == R_TOUCH_KNEE: return "R_TOUCH_KNEE"
    elif index == L_TOUCH_KNEE: return "L_TOUCH_KNEE"
    elif index == R_TOUCH_BACK: return "R_TOUCH_BACK"
    elif index == L_TOUCH_BACK: return "L_TOUCH_BACK"
    elif index == R_RAISE_HAND: return "R_RAISE_HAND"
    elif index == L_RAISE_HAND: return "L_RAISE_HAND"
    else: return "UNKNOWN"
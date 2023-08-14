# %%
import pandas as pd
from bodyFrame import body_frame
from postureClassifier import posture_classifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from kinematicDataGenerator import get_training_data
import postures
from bodyRecordRead import read_body_skeleton
import pickle
from kinectBodyTracker import kinectBodyTracker, _k4abt
from pyKinectAzure import pyKinectAzure, _k4a
import numpy as np
import sys
sys.path.insert(1, 'pyKinectAzure/')


module_filename = "ML/ML_dynamic_module"

# the index of posture we are going to train
posture_to_train = [i for i in range(1, 9)]

# %%
for post in posture_to_train:
    df = get_training_data(post, "train")
    train, test = train_test_split(df, test_size=0.2)
    X_train = train.drop(["result"], axis=1)
    y_train = train["result"].astype('int')
    X_test = test.drop(["result"], axis=1)
    y_test = test["result"].astype('int')
    classifier = RandomForestClassifier()
    classifier.fit(X_train, y_train)
    testPred = classifier.predict(X_test)
    print(testPred)
    print(accuracy_score(testPred, y_test))
    # # print feature importance
    # import matplotlib.pyplot as plt
    # importances = classifier.feature_importances_
    # std = np.std([
    #     tree.feature_importances_ for tree in classifier.estimators_], axis=0)
    # feature_names = [X_train.columns]
    # forest_importances = pd.Series(importances, index=feature_names)
    # fig, ax = plt.subplots()
    # forest_importances.plot.bar(yerr=std, ax=ax)
    # ax.set_title(f"Feature importances using MDI ({postures.get_posture_name_by_index(post)})")
    # ax.set_ylabel("Mean decrease in impurity")
    # fig.tight_layout()
    # plt.show()
    try:
        with open(module_filename, "rb") as file:
            PC = pickle.load(file)
    except:
        PC = posture_classifier()
    PC.add(classifier, post)
    with open(module_filename, "wb") as file:
        pickle.dump(PC, file, True)

# %%
# load the current classifier and test the accuracy for each level of impairment
# try:
#     with open(module_filename, "rb") as file:
#         PC = pickle.load(file)
# except:
#     pass
# for post in posture_to_train:
#     df = df = get_training_data(post, "train")
#     df = df[df['result'] == 0]
#     # train, test = train_test_split(df, test_size=0.8)
#     X_test = df.drop(["result"], axis=1)
#     y_test = df["result"].astype('int')
#     testPred = PC.get_classifier(post).predict(X_test)
#     unique, counts = np.unique(testPred, return_counts=True)
#     print (np.asarray((unique, counts)).T)
#     print(accuracy_score(testPred, y_test))
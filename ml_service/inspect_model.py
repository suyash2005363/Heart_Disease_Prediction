# inspect_model.py
import pickle
from sklearn.pipeline import Pipeline

m = pickle.load(open("heart_model.pkl", "rb"))

print("MODEL TYPE:", type(m))
print("n_features_in_:", getattr(m, "n_features_in_", None))
print("feature_names_in_:", getattr(m, "feature_names_in_", None))

if isinstance(m, Pipeline):
    print("Pipeline steps:", list(m.named_steps.keys()))
    last = list(m.named_steps.values())[-1]
    print("Last estimator type:", type(last))
    print("Last estimator n_features_in_:", getattr(last, "n_features_in_", None))
    print("Last estimator feature_names_in_:", getattr(last, "feature_names_in_", None))

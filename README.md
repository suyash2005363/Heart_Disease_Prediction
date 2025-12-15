# Heart_Disease_Prediction
❤️ Heart Disease Prediction Web Application

A full-stack machine learning web application that predicts the likelihood of heart disease based on user health parameters.
The system combines a trained ML model, a Python backend API, and a user-friendly frontend interface.

🚀 Features

Predicts heart disease risk using machine learning

Clean and simple user interface

Real-time prediction results

Backend API for model inference

Well-structured ML workflow (data preprocessing → training → prediction)

🧠 Machine Learning Model

Algorithm Used: Random Forest Classifier

Reason for choosing Random Forest:

High accuracy

Handles non-linear data well

Robust to overfitting

Works well with medical datasets

Libraries Used:

pandas

numpy

scikit-learn

matplotlib

The model is trained in a Jupyter Notebook and later saved and used in the backend for predictions.

🖥️ Tech Stack
Frontend

HTML

CSS

JavaScript
(or React.js – update if applicable)

Backend

Python

Flask / FastAPI (update whichever you used)

REST API

Machine Learning

Scikit-learn

Pandas

NumPy

📂 Project Structure
heart-disease-predictor/
│
├── notebooks/
│   └── heart_disease_model.ipynb
│
├── backend/
│   ├── main.py
│   ├── model.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── README.md
└── .gitignore

⚙️ How It Works

User enters medical details such as:

Age

Cholesterol

Blood pressure

Heart rate, etc.

Data is sent to the backend API

Backend loads the trained ML model

Model predicts:

Heart Disease Risk: Yes / No

Result is displayed on the frontend

▶️ How to Run the Project Locally
1️⃣ Clone the repository
git clone https://github.com/your-username/heart-disease-predictor.git
cd heart-disease-predictor

2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
python main.py


Backend will start on:

http://localhost:8000


(or 5000 depending on your setup)

3️⃣ Frontend Setup

Open index.html directly in the browser
OR

Use Live Server (recommended)

📊 Dataset

Heart Disease Dataset

Cleaned and preprocessed before training

Feature scaling and validation performed

📌 Future Improvements

Add user authentication

Improve UI/UX

Deploy on cloud (AWS / Render / Railway)

Add detailed health recommendations

Store prediction history

👨‍💻 Author

Suyash
Machine Learning Enthusiast | Full-Stack ML Developer

⭐ If you like this project

Don’t forget to star the repository ⭐
It motivates me to build more projects!

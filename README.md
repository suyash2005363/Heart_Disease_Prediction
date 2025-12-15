Heart Disease Prediction Web Application

This project is a web-based application that predicts the possibility of heart disease using a machine learning model.
It is built as an end-to-end project, combining machine learning, backend development, and frontend design.

The main goal of this project is to understand how a trained ML model can be integrated into a real-world web application.

What This Project Does

Takes health-related inputs from the user

Sends the data to a backend API

Uses a trained ML model to make predictions

Displays the prediction result on the web interface

Machine Learning Part

Model used: Random Forest Classifier

The model is trained using a heart disease dataset

Data preprocessing and model training are done in a Jupyter Notebook

The trained model is saved and used in the backend for predictions

Libraries used:

pandas

numpy

scikit-learn

Tech Stack Used

Frontend

React.js (Vite)

HTML, CSS, JavaScript

Backend

Python

Flask (or FastAPI – update if needed)

Machine Learning

Scikit-learn

Pandas

NumPy

Project Structure
Heart_Disease_Prediction/
├── notebooks/        # Model training notebook
├── backend/          # Backend API and ML model
├── frontend/         # Frontend UI
├── README.md
└── .gitignore

How to Run the Project
Backend
cd backend
pip install -r requirements.txt
python app.py

Frontend
cd frontend
npm install
npm run dev

Why I Built This Project

I built this project to:

Practice machine learning on a real dataset

Learn how ML models are used in backend APIs

Understand frontend–backend communication

Build a complete, deployable ML project

Future Improvements

Improve UI design

Add user authentication

Deploy the application online

Add more detailed health recommendations

Author

Suyash
B.Tech Student | Machine Learning Enthusiast

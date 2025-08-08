## 📥 Step 1: Clone the Project
Download the full project from GitHub.

```
git clone https://subscription-based-products.pages.dev
cd Subscription-Based-Products
```

## ⚙️ Step 2: Setup Backend Environment Variables

Go to the backend folder.

Create a file named .env.

Paste the following and update the fields marked with (*):

```
MONGO_URI=mongodb://127.0.0.1:27017/Digital-Product-Store
JWT_SECRET=secret_key
NODE_ENV=development
PORT=5000
EMAIL_USER="ENTER YOUR SERVICE EMAIL" *
EMAIL_PASS="ENTER YOUR EMAIL SERVICE PASSWORD" *
RAZORPAY_KEY_ID="ENTER YOUR RAZORPAY KEY" *
RAZORPAY_SECRET="ENTER YOUR RAZORPAY SECRET KEY" *
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## ⚙️ Step 3: Setup Frontend Environment Variables
Go to the frontend folder.

Create a file named .env.

Paste the following and update your Razorpay Key:
```
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID="ENTER YOUR SAME RAZORPAY KEY" *
```

## 🖥️ Run the Frontend
Open terminal in the frontend folder.

Run the following commands:

`npm install`      # Install frontend dependencies

`npm run dev`      # Start development server

## 🖥️ Run the Backend
Open terminal in the backend folder.

Run the following commands:

`npm install`      # Install backend dependencies

`nodemon i`       # Start backend server

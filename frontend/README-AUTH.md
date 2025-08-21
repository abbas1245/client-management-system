# SalesForge Authentication Setup

## Background Image Setup

To use your custom background image in the authentication page:

1. **Place your image** in the `frontend/public/` folder
2. **Name it** `background-image.jpg` (or update the path in `src/pages/Auth.js`)
3. **Recommended dimensions**: 1920x1080 or larger
4. **Supported formats**: JPG, PNG, WebP

## Authentication Features

### ✅ What's Included:

- **User Registration**: Sign up with name, email, and password
- **User Login**: Secure authentication with JWT tokens
- **Password Validation**: Strength indicator and confirmation matching
- **Protected Routes**: Dashboard only accessible after login
- **Persistent Sessions**: Tokens stored in localStorage
- **Responsive Design**: Works on all device sizes
- **Theme Consistency**: Matches the overall project design

### 🔐 Security Features:

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration
- **Input Validation**: Server-side validation with express-validator
- **Protected API Routes**: Authentication middleware for sensitive endpoints

### 🎨 Design Features:

- **Split Layout**: Forms on left, background image on right
- **Gradient Overlays**: Purple to sky blue theme
- **Modern UI**: Glassmorphism effects and smooth animations
- **Interactive Elements**: Hover effects and loading states
- **Toast Notifications**: Success/error feedback

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js          # Login form component
│   │   └── Signup.js         # Registration form component
│   ├── contexts/
│   │   └── AuthContext.js    # Authentication state management
│   ├── pages/
│   │   └── Auth.js           # Main authentication page
│   └── App.js                # Updated with auth routing
├── public/
│   └── background-image.jpg  # Your custom background image
└── README-AUTH.md            # This file
```

## Usage

1. **Start the backend**: `cd backend && npm start`
2. **Start the frontend**: `cd frontend && npm start`
3. **Navigate to** `/auth` to see the login/signup page
4. **Create an account** or **sign in** to access the dashboard
5. **Replace the background image** with your custom image

## Customization

### Changing the Background Image:
Update the path in `src/pages/Auth.js`:
```javascript
backgroundImage: `url('/your-image-name.jpg')`
```

### Modifying Colors:
Update the gradient classes in the components to match your brand colors.

### Adding More Fields:
Extend the User model in `backend/models/User.js` and update the forms accordingly.

## Troubleshooting

- **Image not showing**: Ensure the image is in the `public` folder
- **Authentication errors**: Check backend server is running
- **Styling issues**: Verify Tailwind CSS is properly configured
- **Token issues**: Clear localStorage and try logging in again

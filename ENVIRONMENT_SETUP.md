# Environment Setup for BrandByte

## Required Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Appwrite Setup Instructions

1. **Create an Appwrite Project:**
   - Go to [Appwrite Cloud](https://cloud.appwrite.io) or your self-hosted instance
   - Create a new project
   - Copy the Project ID

2. **Configure Authentication:**
   - Go to Auth → Settings in your Appwrite console
   - Enable "Email/Password" authentication method
   - Enable "Email OTP" login method
   - Configure your allowed domains (add `localhost:3000` for development)

3. **Update Environment Variables:**
   - Replace `your_project_id_here` with your actual Project ID
   - Update the endpoint URL if using a different Appwrite instance

## Features Implemented

- **Email OTP Authentication:** Users can sign in/up using email with OTP verification
- **Authentication Context:** Global authentication state management
- **Protected Routes:** Ready for implementing route protection
- **Responsive UI:** Works on both desktop and mobile devices

## Authentication Flow

1. User enters email address
2. Appwrite sends OTP to email
3. User enters OTP code
4. Account is created/accessed automatically
5. User is redirected to the main application

## Next Steps

- Add route protection for authenticated-only pages
- Implement user profile management
- Add password reset functionality (if needed)
- Configure email templates in Appwrite console 
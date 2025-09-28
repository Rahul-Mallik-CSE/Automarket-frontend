<!-- @format -->

# Password Reset Authentication Flow

This document outlines the complete password reset process implementation.

## API Endpoints

### 1. Request Password Reset

- **Endpoint**: `/auth/password-reset/request/`
- **Method**: POST
- **Data**: `{ "email": "user@example.com" }`
- **Purpose**: Sends OTP to user's email for password reset

### 2. Verify Reset OTP

- **Endpoint**: `/auth/reset/otp-verify/`
- **Method**: POST
- **Data**: `{ "email": "user@example.com", "otp": "123456" }`
- **Purpose**: Verifies the OTP sent to user's email

### 3. Confirm Password Reset

- **Endpoint**: `/auth/password-reset/confirm/`
- **Method**: POST
- **Data**:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

- **Purpose**: Resets the password with the verified OTP

## Implementation Files

### 1. API Configuration

- **File**: `redux/features/authAPI.tsx`
- **Exports**:
  - `useRequestPasswordResetMutation`
  - `useVerifyResetOtpMutation`
  - `useConfirmPasswordResetMutation`

### 2. Complete Password Reset Component

- **File**: `components/auth/reset-password.tsx`
- **Component**: `ResetPasswordComponent`
- **Features**:
  - Step-by-step wizard (Request → Verify → Reset → Complete)
  - Input validation
  - Error handling
  - Loading states
  - OTP resend functionality
  - Password visibility toggle

### 3. Page Implementation

- **File**: `app/auth/reset-password/page.tsx`
- **Route**: `/auth/reset-password`
- **Uses**: ResetPasswordComponent with proper styling

## User Flow

1. **Request Reset**: User enters email → OTP sent to email
2. **Verify OTP**: User enters 6-digit OTP → OTP verified
3. **Reset Password**: User sets new password → Password updated
4. **Complete**: Success message → Redirect to sign in

## Features

- ✅ Complete 4-step wizard interface
- ✅ Real-time form validation
- ✅ Error handling with user-friendly messages
- ✅ Loading states for all API calls
- ✅ OTP resend functionality
- ✅ Password visibility toggles
- ✅ Responsive design
- ✅ Back navigation between steps
- ✅ TypeScript support with proper types

## Testing

You can test the password reset flow by:

1. Navigate to `/auth/reset-password`
2. Enter a valid email address
3. Check your email for the OTP
4. Enter the OTP to verify
5. Set your new password
6. Complete the flow and sign in

## Security Features

- OTP verification required
- Password confirmation validation
- Minimum password length requirements
- Session-based flow (OTP required for password reset)
- Error messages don't reveal sensitive information

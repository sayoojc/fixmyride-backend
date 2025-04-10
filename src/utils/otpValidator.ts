// ✅ Compares the provided OTP with the stored OTP
export const validateOtp = (storedOtp: string, providedOtp: string): boolean => {
    if (!storedOtp || !providedOtp) {
        return false;
    }

    // Check if OTPs match
    return storedOtp === providedOtp;
};

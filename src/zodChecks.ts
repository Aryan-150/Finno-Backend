// password should have atleast one lowercase, one upercase, one special character and one number.

export const hasLowerCase = (str: string) => /[a-z]/.test(str);
export const hasUpperCase = (str: string) => /[A-Z]/.test(str);
export const hasSpecialChar = (str: string) => /[-+=!@#$%&^?*, ]/.test(str);
export const hasNumber = (str: string) => /\d/.test(str);
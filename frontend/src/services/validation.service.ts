interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
}

interface ValidationRules {
    [key: string]: ValidationRule[];
}

interface ValidationResult {
    isValid: boolean;
    errors: {
        [key: string]: string[];
    };
}

class ValidationService {
    private rules: ValidationRules = {};

    // Common validation rules
    private commonRules = {
        required: {
            validate: (value: any) => value !== undefined && value !== null && value !== '',
            message: 'This field is required',
        },
        email: {
            validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Invalid email format',
        },
        minLength: (length: number) => ({
            validate: (value: string) => value.length >= length,
            message: `Minimum length is ${length} characters`,
        }),
        maxLength: (length: number) => ({
            validate: (value: string) => value.length <= length,
            message: `Maximum length is ${length} characters`,
        }),
        min: (value: number) => ({
            validate: (input: number) => input >= value,
            message: `Minimum value is ${value}`,
        }),
        max: (value: number) => ({
            validate: (input: number) => input <= value,
            message: `Maximum value is ${value}`,
        }),
        pattern: (regex: RegExp, message: string) => ({
            validate: (value: string) => regex.test(value),
            message,
        }),
        match: (field: string, message: string) => ({
            validate: (value: any, formData: any) => value === formData[field],
            message,
        }),
        custom: (validator: (value: any) => boolean, message: string) => ({
            validate: validator,
            message,
        }),
    };

    // Add validation rules for a field
    addRules(field: string, rules: ValidationRule[]): void {
        this.rules[field] = rules;
    }

    // Remove validation rules for a field
    removeRules(field: string): void {
        delete this.rules[field];
    }

    // Clear all validation rules
    clearRules(): void {
        this.rules = {};
    }

    // Validate a single field
    validateField(field: string, value: any, formData?: any): string[] {
        const fieldRules = this.rules[field];
        if (!fieldRules) return [];

        const errors: string[] = [];

        for (const rule of fieldRules) {
            const isValid = rule.validate(value, formData);
            if (!isValid) {
                errors.push(rule.message);
            }
        }

        return errors;
    }

    // Validate an entire form
    validateForm(formData: any): ValidationResult {
        const errors: { [key: string]: string[] } = {};
        let isValid = true;

        for (const field in this.rules) {
            const fieldErrors = this.validateField(field, formData[field], formData);
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    // Get common validation rules
    getCommonRules() {
        return this.commonRules;
    }

    // Create a required rule with custom message
    createRequiredRule(message?: string): ValidationRule {
        return {
            validate: this.commonRules.required.validate,
            message: message || this.commonRules.required.message,
        };
    }

    // Create an email rule with custom message
    createEmailRule(message?: string): ValidationRule {
        return {
            validate: this.commonRules.email.validate,
            message: message || this.commonRules.email.message,
        };
    }

    // Create a min length rule
    createMinLengthRule(length: number, message?: string): ValidationRule {
        return {
            validate: this.commonRules.minLength(length).validate,
            message: message || this.commonRules.minLength(length).message,
        };
    }

    // Create a max length rule
    createMaxLengthRule(length: number, message?: string): ValidationRule {
        return {
            validate: this.commonRules.maxLength(length).validate,
            message: message || this.commonRules.maxLength(length).message,
        };
    }

    // Create a min value rule
    createMinRule(value: number, message?: string): ValidationRule {
        return {
            validate: this.commonRules.min(value).validate,
            message: message || this.commonRules.min(value).message,
        };
    }

    // Create a max value rule
    createMaxRule(value: number, message?: string): ValidationRule {
        return {
            validate: this.commonRules.max(value).validate,
            message: message || this.commonRules.max(value).message,
        };
    }

    // Create a pattern rule
    createPatternRule(regex: RegExp, message: string): ValidationRule {
        return {
            validate: this.commonRules.pattern(regex, message).validate,
            message,
        };
    }

    // Create a match rule
    createMatchRule(field: string, message: string): ValidationRule {
        return {
            validate: this.commonRules.match(field, message).validate,
            message,
        };
    }

    // Create a custom rule
    createCustomRule(validator: (value: any) => boolean, message: string): ValidationRule {
        return {
            validate: validator,
            message,
        };
    }

    // Validate a password
    validatePassword(password: string): string[] {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        return errors;
    }

    // Validate a phone number
    validatePhoneNumber(phone: string): string[] {
        const errors: string[] = [];

        if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
            errors.push('Invalid phone number format');
        }

        return errors;
    }

    // Validate a URL
    validateUrl(url: string): string[] {
        const errors: string[] = [];

        try {
            new URL(url);
        } catch {
            errors.push('Invalid URL format');
        }

        return errors;
    }

    // Validate a date
    validateDate(date: string): string[] {
        const errors: string[] = [];

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            errors.push('Invalid date format (YYYY-MM-DD)');
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            errors.push('Invalid date');
        }

        return errors;
    }

    // Validate a time
    validateTime(time: string): string[] {
        const errors: string[] = [];

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
            errors.push('Invalid time format (HH:MM)');
        }

        return errors;
    }

    // Validate a credit card number
    validateCreditCard(cardNumber: string): string[] {
        const errors: string[] = [];

        // Remove spaces and dashes
        const cleanNumber = cardNumber.replace(/[\s-]/g, '');

        // Check if it's a valid number
        if (!/^\d{13,19}$/.test(cleanNumber)) {
            errors.push('Invalid credit card number');
            return errors;
        }

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        if (sum % 10 !== 0) {
            errors.push('Invalid credit card number');
        }

        return errors;
    }

    // Validate a postal code
    validatePostalCode(postalCode: string): string[] {
        const errors: string[] = [];

        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
            errors.push('Invalid postal code format');
        }

        return errors;
    }

    // Validate a social security number
    validateSSN(ssn: string): string[] {
        const errors: string[] = [];

        if (!/^\d{3}-?\d{2}-?\d{4}$/.test(ssn)) {
            errors.push('Invalid SSN format');
        }

        return errors;
    }

    // Validate a tax ID
    validateTaxId(taxId: string): string[] {
        const errors: string[] = [];

        if (!/^\d{2}-?\d{7}$/.test(taxId)) {
            errors.push('Invalid tax ID format');
        }

        return errors;
    }

    // Validate a currency amount
    validateCurrency(amount: string): string[] {
        const errors: string[] = [];

        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            errors.push('Invalid currency amount');
        }

        return errors;
    }

    // Validate a percentage
    validatePercentage(percentage: string): string[] {
        const errors: string[] = [];

        if (!/^\d+(\.\d{1,2})?%?$/.test(percentage)) {
            errors.push('Invalid percentage');
        }

        const value = parseFloat(percentage);
        if (value < 0 || value > 100) {
            errors.push('Percentage must be between 0 and 100');
        }

        return errors;
    }
}

export const validationService = new ValidationService(); 
const CreditCardValidator = {
  cleanCardNumber(value) {
    return String(value || "").replace(/[\s-]/g, "");
  },

  detectCardType(cardNumber) {
    const number = this.cleanCardNumber(cardNumber);

    const visaRegex = /^4\d{12}(\d{3})?(\d{3})?$/;

    const mastercardRegex =
      /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/;

    if (visaRegex.test(number)) return "visa";
    if (mastercardRegex.test(number)) return "mastercard";

    if (/^4/.test(number)) return "visa_incomplete";

    const firstTwo = Number(number.slice(0, 2));
    const firstFour = Number(number.slice(0, 4));

    if (
      (firstTwo >= 51 && firstTwo <= 55) ||
      (firstFour >= 2221 && firstFour <= 2720)
    ) {
      return "mastercard_incomplete";
    }

    return "unknown";
  },

  isValidLuhn(cardNumber) {
    const digits = this.cleanCardNumber(cardNumber);

    if (!/^\d+$/.test(digits)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number(digits[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  },

  validateCardNumber(cardNumber) {
    const number = this.cleanCardNumber(cardNumber);

    if (!number) {
      return {
        valid: false,
        type: "unknown",
        message: "Card number is required.",
      };
    }

    if (!/^\d+$/.test(number)) {
      return {
        valid: false,
        type: "unknown",
        message: "Card number must contain digits only.",
      };
    }

    const type = this.detectCardType(number);
    const isVisa = type === "visa";
    const isMastercard = type === "mastercard";

    if (!isVisa && !isMastercard) {
      return {
        valid: false,
        type,
        message: "Only Visa and Mastercard are accepted.",
      };
    }

    if (!this.isValidLuhn(number)) {
      return {
        valid: false,
        type,
        message: "Invalid card number.",
      };
    }

    return {
      valid: true,
      type,
      message: "",
    };
  },

  validateExpiry(month, year) {
    const cleanMonth = String(month || "").trim();
    let cleanYear = String(year || "").trim();

    if (!cleanMonth || !cleanYear) {
      return {
        valid: false,
        message: "Expiry date is required.",
      };
    }

    if (!/^\d{1,2}$/.test(cleanMonth)) {
      return {
        valid: false,
        message: "Expiry month must be valid.",
      };
    }

    if (!/^\d{2}$|^\d{4}$/.test(cleanYear)) {
      return {
        valid: false,
        message: "Expiry year must be valid.",
      };
    }

    const monthNumber = Number(cleanMonth);

    if (monthNumber < 1 || monthNumber > 12) {
      return {
        valid: false,
        message: "Expiry month must be between 01 and 12.",
      };
    }

    if (cleanYear.length === 2) {
      cleanYear = `20${cleanYear}`;
    }

    const yearNumber = Number(cleanYear);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      yearNumber < currentYear ||
      (yearNumber === currentYear && monthNumber < currentMonth)
    ) {
      return {
        valid: false,
        message: "Card has expired.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  },

  validateExpiryString(expiryValue) {
    const value = String(expiryValue || "").trim();

    if (!value) {
      return {
        valid: false,
        message: "Expiry date is required.",
      };
    }

    const match = value.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);

    if (!match) {
      return {
        valid: false,
        message: "Expiry date must be in MM/YY format.",
      };
    }

    return this.validateExpiry(match[1], match[2]);
  },

  validateCvv(cvv) {
    const value = String(cvv || "").trim();

    if (!value) {
      return {
        valid: false,
        message: "CVV is required.",
      };
    }

    if (!/^\d{3}$/.test(value)) {
      return {
        valid: false,
        message: "CVV must be exactly 3 digits.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  },

  validateCardholderName(name) {
    const value = String(name || "").trim();

    if (!value) {
      return {
        valid: false,
        message: "Cardholder name is required.",
      };
    }

    if (value.length < 2) {
      return {
        valid: false,
        message: "Cardholder name is too short.",
      };
    }

    if (!/^[a-zA-Z\s'-]{2,}$/.test(value)) {
      return {
        valid: false,
        message: "Cardholder name contains invalid characters.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  },

  formatCardNumber(value) {
    const number = this.cleanCardNumber(value).replace(/\D/g, "");
    return number.replace(/(.{4})/g, "$1 ").trim();
  },

  formatExpiry(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  },

  validateAll({ cardNumber, expiry, expiryMonth, expiryYear, cvv, cardholderName }) {
    const cardNumberResult = this.validateCardNumber(cardNumber);

    const expiryResult =
      expiry !== undefined
        ? this.validateExpiryString(expiry)
        : this.validateExpiry(expiryMonth, expiryYear);

    const cvvResult = this.validateCvv(cvv);
    const nameResult = this.validateCardholderName(cardholderName);

    const isValid =
      cardNumberResult.valid &&
      expiryResult.valid &&
      cvvResult.valid &&
      nameResult.valid;

    return {
      valid: isValid,
      cardType: cardNumberResult.type,
      fields: {
        cardNumber: cardNumberResult,
        expiry: expiryResult,
        cvv: cvvResult,
        cardholderName: nameResult,
      },
    };
  },
};

export default CreditCardValidator;

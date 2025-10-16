// Security utilities for registration endpoint

export const SecurityConfig = {
    RATE_LIMIT: {
        MAX_ATTEMPTS: 3,
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
    },
    
    // Honeypot field names (if present in request, it's likely a bot)
    HONEYPOT_FIELDS: ['website', 'url', 'phone', 'company'],
    
    // Common disposable email providers
    DISPOSABLE_DOMAINS: [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org',
        'getnada.com', 'maildrop.cc', 'yopmail.com', 'sharklasers.com',
        'grr.la', 'guerrillamail.info', 'guerrillamail.net'
    ],
    
    // Suspicious email patterns
    SUSPICIOUS_EMAIL_PATTERNS: [
        /test\d+@/i,           // test123@domain.com
        /user\d+@/i,           // user123@domain.com  
        /admin\d+@/i,          // admin123@domain.com
        /\+.*\+.*@/i,          // multiple + signs
        /(.)\1{4,}@/i,         // repeated characters (aaaaa@domain.com)
        /^[a-z]{1,3}\d{3,}@/i, // short letters + many numbers
    ],
    
    // Suspicious name patterns
    SUSPICIOUS_NAME_PATTERNS: [
        /^[a-zA-Z]\1+$/,       // repeated single character
        /^\d+$/,               // only numbers
        /test|demo|sample/i,    // test/demo accounts
        /^.{1}$/,              // single character
        /admin|root|user/i,    // common system names
    ]
};

// Enhanced security validation
export function validateRegistrationSecurity(userData, request) {
    const errors = [];
    
    // Check for honeypot fields (bot detection)
    for (const field of SecurityConfig.HONEYPOT_FIELDS) {
        if (userData[field] !== undefined && userData[field] !== '') {
            console.log(`[Security] Honeypot field '${field}' filled - likely bot`);
            errors.push('Invalid request');
            break;
        }
    }
    
    // Email security checks
    const emailDomain = userData.email?.split('@')[1]?.toLowerCase();
    if (emailDomain && SecurityConfig.DISPOSABLE_DOMAINS.includes(emailDomain)) {
        errors.push('Disposable email addresses are not allowed');
    }
    
    if (SecurityConfig.SUSPICIOUS_EMAIL_PATTERNS.some(pattern => pattern.test(userData.email))) {
        errors.push('Please provide a valid email address');
    }
    
    // Name security checks
    if (SecurityConfig.SUSPICIOUS_NAME_PATTERNS.some(pattern => pattern.test(userData.name))) {
        errors.push('Please provide a valid name');
    }
    
    // Check request timing (too fast = likely bot)
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent || userAgent.length < 10) {
        errors.push('Invalid request');
    }
    
    // Check for common bot user agents
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i, 
        /curl/i, /wget/i, /python/i, /java/i
    ];
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        console.log(`[Security] Suspicious user agent detected: ${userAgent}`);
        errors.push('Invalid request');
    }
    
    return errors;
}

// Simple CAPTCHA-like challenge (for future implementation)
export function generateChallenge() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    return {
        question: `What is ${num1} + ${num2}?`,
        answer: answer.toString()
    };
}
package com.ticket.userservice.service;

import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.GCMParameterSpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;

@Service
@RequiredArgsConstructor
public class TotpMfaService {
    private static final String BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final String ISSUER = "TicketDesk";
    private static final int PERIOD_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailService userDetailService;

    @Value("${jwt.secret}")
    private String encryptionSecret;

    @Transactional(readOnly = true)
    public boolean isEnabledFor(String loginIdentifier) {
        return findUser(loginIdentifier).map(user -> Boolean.TRUE.equals(user.getMfaEnabled())).orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean verifyLoginCode(String loginIdentifier, String code) {
        return findUser(loginIdentifier)
                .filter(user -> Boolean.TRUE.equals(user.getMfaEnabled()))
                .map(user -> verifySecret(user.getMfaSecret(), code))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(User user) {
        return Boolean.TRUE.equals(user.getMfaEnabled());
    }

    @Transactional
    public SetupResult beginSetup(User user) {
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new IllegalStateException("Two-factor authentication is already enabled.");
        }
        String secret = newSecret();
        user.setMfaSecret(encrypt(secret));
        user.setMfaEnabled(false);
        userRepository.save(user);
        String label = URLEncoder.encode(ISSUER + ":" + user.getUsername(), StandardCharsets.UTF_8).replace("+", "%20");
        String issuer = URLEncoder.encode(ISSUER, StandardCharsets.UTF_8).replace("+", "%20");
        String uri = "otpauth://totp/" + label + "?secret=" + secret + "&issuer=" + issuer
                + "&algorithm=SHA1&digits=" + CODE_DIGITS + "&period=" + PERIOD_SECONDS;
        return new SetupResult(secret, uri);
    }

    @Transactional
    public boolean enable(User user, String code) {
        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) return false;
        if (!verifySecret(user.getMfaSecret(), code)) {
            userDetailService.saveUserAttemptAuthentication(user.getUsername());
            return false;
        }
        user.setMfaEnabled(true);
        userRepository.save(user);
        userDetailService.updateAttempt(user.getUsername());
        return true;
    }

    @Transactional
    public boolean disable(User user, String code) {
        if (!verifySecret(user.getMfaSecret(), code)) {
            userDetailService.saveUserAttemptAuthentication(user.getUsername());
            return false;
        }
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
        userDetailService.updateAttempt(user.getUsername());
        return true;
    }

    private Optional<User> findUser(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        return userRepository.findByUsernameOrEmail(identifier, identifier);
    }

    private String newSecret() {
        byte[] bytes = new byte[20];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    private boolean verifySecret(String encryptedSecret, String code) {
        if (encryptedSecret == null || code == null || !code.matches("[0-9]{6}")) return false;
        byte[] secret;
        try {
            secret = base32Decode(decrypt(encryptedSecret));
        } catch (RuntimeException ex) {
            return false;
        }
        long current = Instant.now().getEpochSecond() / PERIOD_SECONDS;
        byte[] supplied = code.getBytes(StandardCharsets.US_ASCII);
        for (long offset = -1; offset <= 1; offset++) {
            String candidate = codeAt(secret, current + offset);
            if (MessageDigest.isEqual(supplied, candidate.getBytes(StandardCharsets.US_ASCII))) return true;
        }
        return false;
    }

    static String codeAt(byte[] secret, long counter) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(secret, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(Long.BYTES).putLong(counter).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return String.format("%0" + CODE_DIGITS + "d", binary % 1_000_000);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not generate an authenticator code.", ex);
        }
    }

    private String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[12];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey(), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return "v1:" + Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv).put(encrypted).array());
        } catch (Exception ex) {
            throw new IllegalStateException("Could not protect the authenticator secret.", ex);
        }
    }

    private String decrypt(String ciphertext) {
        try {
            if (!ciphertext.startsWith("v1:")) throw new IllegalArgumentException("Unsupported MFA secret format.");
            byte[] packed = Base64.getDecoder().decode(ciphertext.substring(3));
            byte[] iv = Arrays.copyOfRange(packed, 0, 12);
            byte[] encrypted = Arrays.copyOfRange(packed, 12, packed.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey(), new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not read the authenticator secret.", ex);
        }
    }

    private SecretKeySpec encryptionKey() throws Exception {
        if (encryptionSecret == null || encryptionSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be configured to encrypt authenticator secrets.");
        }
        byte[] decoded = Base64.getDecoder().decode(encryptionSecret);
        return new SecretKeySpec(MessageDigest.getInstance("SHA-256").digest(decoded), "AES");
    }

    private String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        for (byte value : data) {
            buffer = (buffer << 8) | (value & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                result.append(BASE32.charAt((buffer >> (bitsLeft - 5)) & 0x1f));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) result.append(BASE32.charAt((buffer << (5 - bitsLeft)) & 0x1f));
        return result.toString();
    }

    private byte[] base32Decode(String value) {
        String normalized = value.replace("=", "").toUpperCase();
        byte[] output = new byte[(normalized.length() * 5) / 8];
        int buffer = 0;
        int bitsLeft = 0;
        int index = 0;
        for (char c : normalized.toCharArray()) {
            int digit = BASE32.indexOf(c);
            if (digit < 0) throw new IllegalArgumentException("Invalid Base32 secret.");
            buffer = (buffer << 5) | digit;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                output[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xff);
                bitsLeft -= 8;
            }
        }
        return output;
    }

    public record SetupResult(String secret, String provisioningUri) {}
}

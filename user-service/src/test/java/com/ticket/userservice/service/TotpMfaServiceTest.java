package com.ticket.userservice.service;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TotpMfaServiceTest {
    private static final byte[] RFC_SECRET = "12345678901234567890".getBytes(StandardCharsets.US_ASCII);

    @Test
    void generatesRfc6238Sha1Codes() {
        assertEquals("287082", TotpMfaService.codeAt(RFC_SECRET, 1));
        assertEquals("081804", TotpMfaService.codeAt(RFC_SECRET, 37_037_036));
        assertEquals("050471", TotpMfaService.codeAt(RFC_SECRET, 37_037_037));
        assertEquals("005924", TotpMfaService.codeAt(RFC_SECRET, 41_152_263));
        assertEquals("279037", TotpMfaService.codeAt(RFC_SECRET, 66_666_666));
        assertEquals("353130", TotpMfaService.codeAt(RFC_SECRET, 666_666_666));
    }
}

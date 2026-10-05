package com.ticket.common.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {
    @ParameterizedTest
    @CsvSource({
            "400,400",
            "401,401",
            "403,403",
            "404,404",
            "409,409",
            "423,423",
            "500,500",
            "NOT_FOUND,400",
            "UNKNOWN_CODE,400"
    })
    void mapsErrorEnvelopeToCorrectHttpStatus(String code, int expectedStatus) {
        ResponseErrorTemplate error = new ResponseErrorTemplate("failed", code, null, true);

        var response = ApiResponse.from(error);

        assertThat(response.getStatusCode().value()).isEqualTo(expectedStatus);
        assertThat(response.getBody()).isSameAs(error);
    }

    @Test
    void keepsSuccessfulEnvelopeAtHttp200() {
        ResponseErrorTemplate success = new ResponseErrorTemplate("ok", "SUCCESS", null, false);

        var response = ApiResponse.from(success);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(success);
    }
}

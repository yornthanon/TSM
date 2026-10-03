package com.ticket.userservice.filter;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.AuthenticationRequest;
import com.ticket.userservice.dto.response.AuthenticationResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.TotpMfaService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import com.ticket.userservice.utils.CustomMessageExceptionUtils;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Collections;

@Slf4j
public class JwtAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final CustomUserDetailService customUserDetailService;
    private final TotpMfaService mfaService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   ObjectMapper objectMapper,
                                   String jwtConfigUrl,
                                   AuthenticationManager authenticationManager,
                                   CustomUserDetailService customUserDetailService,
                                   TotpMfaService mfaService) {
        super(PathPatternRequestMatcher.pathPattern(HttpMethod.POST, jwtConfigUrl));
        setAuthenticationManager(authenticationManager);
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.customUserDetailService = customUserDetailService;
        this.mfaService = mfaService;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException {

        log.info("Start attempt to authentication");
        AuthenticationRequest authenticationRequest = objectMapper.readValue(request.getInputStream(),
                AuthenticationRequest.class);
        request.setAttribute("totp_code", authenticationRequest.totpCode());

        customUserDetailService.saveUserAttemptAuthentication(authenticationRequest.username());
        log.info("End attempt to authentication");
        return getAuthenticationManager()
                .authenticate(new UsernamePasswordAuthenticationToken(
                        authenticationRequest.username(),
                        authenticationRequest.password(),
                        Collections.emptyList())
                );
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
                                            Authentication authResult) throws IOException {

        CustomUserDetail customUserDetail = (CustomUserDetail) authResult.getPrincipal();
        if (mfaService.isEnabledFor(customUserDetail.getUsername())) {
            String code = (String) request.getAttribute("totp_code");
            String errorCode = StringUtils.hasText(code) ? "MFA_INVALID" : "MFA_REQUIRED";
            if (!mfaService.verifyLoginCode(customUserDetail.getUsername(), code)) {
                String message = "MFA_REQUIRED".equals(errorCode)
                        ? "Enter your authenticator code to finish signing in."
                        : "The authenticator code is invalid. Try the current 6-digit code.";
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(objectMapper.writeValueAsString(
                        new ResponseErrorTemplate(message, errorCode, null, true)));
                return;
            }
        }
        customUserDetailService.updateAttempt(customUserDetail.getUsername());
        var accessToken = jwtService.generateToken(customUserDetail);
        var refreshToken = jwtService.refreshToken(customUserDetail);
        AuthenticationResponse authenticationResponse = new AuthenticationResponse(
                accessToken,
                refreshToken
        );

        var responseErrorTemplate = new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                authenticationResponse,
                false
        );
        var jsonUser = objectMapper.writeValueAsString(responseErrorTemplate);

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(jsonUser);
        log.info("Successful Authentication {}", authenticationResponse);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed) throws IOException, ServletException {

        var messageException = CustomMessageExceptionUtils.unauthorized();
        var msgJson = objectMapper.writeValueAsString(messageException);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(msgJson);
        log.info("Unsuccessful Authentication {}", failed.getLocalizedMessage());
    }
}

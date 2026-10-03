package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.MfaCodeRequest;
import com.ticket.userservice.dto.request.MfaDisableRequest;
import com.ticket.userservice.dto.response.MfaSetupResponse;
import com.ticket.userservice.dto.response.MfaStatusResponse;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.TotpMfaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me/mfa")
@RequiredArgsConstructor
public class MfaController {
    private final UserRepository userRepository;
    private final TotpMfaService mfaService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> status(Authentication authentication) {
        User user = currentUser(authentication);
        return ok(new MfaStatusResponse(mfaService.isEnabled(user)));
    }

    @PostMapping("/setup")
    public ResponseEntity<ResponseErrorTemplate> setup(Authentication authentication) {
        User user = currentUser(authentication);
        try {
            TotpMfaService.SetupResult setup = mfaService.beginSetup(user);
            return ok(new MfaSetupResponse(setup.secret(), setup.provisioningUri()));
        } catch (IllegalStateException ex) {
            return error(HttpStatus.CONFLICT, "MFA_ALREADY_ENABLED", ex.getMessage());
        }
    }

    @PostMapping("/enable")
    public ResponseEntity<ResponseErrorTemplate> enable(Authentication authentication,
                                                         @RequestBody MfaCodeRequest request) {
        User user = currentUser(authentication);
        if (request == null || !mfaService.enable(user, request.code())) {
            return error(HttpStatus.BAD_REQUEST, "MFA_INVALID_CODE", "The authenticator code is invalid.");
        }
        return ok(new MfaStatusResponse(true));
    }

    @PostMapping("/disable")
    public ResponseEntity<ResponseErrorTemplate> disable(Authentication authentication,
                                                          @RequestBody MfaDisableRequest request) {
        User user = currentUser(authentication);
        if (request == null || !mfaService.disable(user, request.password(), request.code())) {
            return error(HttpStatus.BAD_REQUEST, "MFA_REAUTH_FAILED",
                    "Password or authenticator code is incorrect.");
        }
        return ok(new MfaStatusResponse(false));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                    "Authentication is required.");
        }
        User user = userRepository.findByUsername(authentication.getName());
        if (user == null) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException(
                    "Authenticated account was not found.");
        }
        return user;
    }

    private ResponseEntity<ResponseErrorTemplate> ok(Object data) {
        return ResponseEntity.ok(new ResponseErrorTemplate("Success", "SUCCESS", data, false));
    }

    private ResponseEntity<ResponseErrorTemplate> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ResponseErrorTemplate(message, code, null, true));
    }
}

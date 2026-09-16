package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.AuthenticationRequest;

public interface AuthService {

    ResponseErrorTemplate login(AuthenticationRequest authenticationRequest);
}

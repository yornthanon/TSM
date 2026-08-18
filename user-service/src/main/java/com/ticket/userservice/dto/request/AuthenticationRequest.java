package com.ticket.userservice.dto.request;

public record AuthenticationRequest(
        String username,
        String password)
{}
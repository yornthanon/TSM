package com.ticket.userservice.service;

import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminActAsServiceTest {
    @Mock private JdbcTemplate jdbcTemplate;
    @Mock private UserRepository userRepository;
    @Mock private TenantWorkspaceRepository workspaceRepository;
    @Mock private CustomUserDetailService userDetailService;
    @Mock private JwtService jwtService;
    @InjectMocks private AdminActAsService service;

    @Test
    void nearMatchEmailCannotStartActAsSession() {
        ReflectionTestUtils.setField(service, "platformAdminEmails", "yornthanon.dev@gmail.com");
        Authentication authentication = mock(Authentication.class);
        User actor = mock(User.class);
        when(authentication.getName()).thenReturn("yornthano");
        when(userRepository.findByUsername("yornthano")).thenReturn(actor);
        when(actor.getStatus()).thenReturn("ACTIVE");
        when(actor.getEmail()).thenReturn("yornthano@gmail.com");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.start(2L, authentication));

        assertEquals(403, exception.getStatusCode().value());
        verify(userRepository, never()).findById(anyLong());
        verifyNoInteractions(jdbcTemplate, workspaceRepository, userDetailService, jwtService);
    }
}

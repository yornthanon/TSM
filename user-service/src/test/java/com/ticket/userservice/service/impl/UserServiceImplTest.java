package com.ticket.userservice.service.impl;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.repository.BaseRepository;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.repository.GroupRepository;
import com.ticket.userservice.repository.OAuthLoginCodeRepository;
import com.ticket.userservice.repository.RefreshTokenRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.UserHandlerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private UserHandlerService userHandlerService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private BaseRepository baseRepository;
    @Mock private UserSearchServiceImpl userSearchService;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private OAuthLoginCodeRepository oauthLoginCodeRepository;

    @InjectMocks private UserServiceImpl service;

    @BeforeEach
    void configurePlatformAdminAllowlist() {
        ReflectionTestUtils.setField(service, "platformAdminEmails", "yornthanon.dev@gmail.com");
    }

    @Test
    void configuredPlatformAdminCannotBeDeleted() {
        User admin = new User();
        admin.setId(1L);
        admin.setEmail("Yornthanon.Dev@gmail.com");
        when(baseRepository.getByField("id", 1L, User.class)).thenReturn(admin);

        assertThrows(BasedException.class, () -> service.delete(1L));
        assertThrows(BasedException.class, () -> service.disActivateUser(1L));

        verifyNoInteractions(refreshTokenRepository, oauthLoginCodeRepository);
        verify(baseRepository, never()).delete(admin);
        verify(baseRepository, never()).saveOrUpdate(admin);
    }

    @Test
    void deletingRegularUserRevokesTokensAndOauthCodesBeforeRemovingAccount() {
        User user = new User();
        user.setId(27L);
        user.setEmail("member@example.com");
        when(baseRepository.getByField("id", 27L, User.class)).thenReturn(user);

        ResponseErrorTemplate response = service.delete(27L);

        assertFalse(response.isError());
        verify(refreshTokenRepository).deleteByUser(user);
        verify(oauthLoginCodeRepository).deleteAllByUserId(27L);
        verify(baseRepository).delete(user);
    }
}

package com.ticket.userservice.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.response.UserResponse;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.UserHandlerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.lang.reflect.RecordComponent;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserSearchServiceImplTest {
    @Mock private UserRepository userRepository;
    @Mock private UserHandlerService userHandlerService;
    @InjectMocks private UserSearchServiceImpl service;

    @Test
    void searchMapsEntitiesToCredentialFreeResponseDtos() {
        User entity = new User();
        entity.setId(41L);
        entity.setUsername("tenant-member");
        entity.setPassword("$2a$encoded-password-hash");
        entity.setMfaSecret("encrypted-mfa-secret");

        UserResponse safeResponse = new UserResponse(
                41L, "tenant-member", "Member", null, null, "member@example.com", "USER",
                null, null, null, 0, 5, null, null, "ACTIVE", Set.of("USER"), Set.of(), null, null);

        when(userRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entity), PageRequest.of(0, 10), 1));
        when(userHandlerService.mapUserToUserResponse(entity)).thenReturn(safeResponse);

        PageableResponseVO<UserResponse> result = service.searchUsers(new UserFilterRequest());

        assertEquals(List.of(safeResponse), result.getContent());
        assertInstanceOf(UserResponse.class, result.getContent().getFirst());
        assertFalse(hasSensitiveRecordComponent(UserResponse.class, "password"));
        assertFalse(hasSensitiveRecordComponent(UserResponse.class, "mfaSecret"));
    }

    @Test
    void userEntityMarksSecretsAsIgnoredForAccidentalSerialization() throws Exception {
        assertNotNull(User.class.getDeclaredField("password").getAnnotation(JsonIgnore.class));
        assertNotNull(User.class.getDeclaredField("mfaSecret").getAnnotation(JsonIgnore.class));
    }

    private boolean hasSensitiveRecordComponent(Class<?> type, String name) {
        return java.util.Arrays.stream(type.getRecordComponents())
                .map(RecordComponent::getName)
                .anyMatch(name::equals);
    }
}

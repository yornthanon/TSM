package com.ticket.userservice;

import com.ticket.userservice.entity.Role;
import com.ticket.userservice.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceApplicationStartupTest {

    @Test
    void startupSeedsOnlyRoleDefinitions() throws Exception {
        RoleRepository roleRepository = mock(RoleRepository.class);
        when(roleRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(roleRepository.saveAndFlush(any(Role.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        new UserServiceApplication().commandLineRunner(roleRepository).run(new String[0]);

        ArgumentCaptor<Role> savedRoles = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository, times(3)).saveAndFlush(savedRoles.capture());
        Set<String> names = savedRoles.getAllValues().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        assertEquals(Set.of("ADMIN", "TENANT_ADMIN", "USER"), names);
    }
}

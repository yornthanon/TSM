package com.ticket.userservice.service.handle;

import com.ticket.userservice.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserHandlerServiceTest {

    @Test
    void mapsTenantIdForAdminWorkspaceSelection() {
        User user = new User();
        user.setTenantId(73L);

        UserHandlerService handler = new UserHandlerService(null, null, null);
        var response = handler.mapUserToUserResponse(user);

        assertEquals(73L, response.tenantId());
    }
}

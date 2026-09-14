package com.ticket.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "jwt.secret=${JWT_SECRET:wM0mBxIDFKh1FOCWfA++ZCSk8d1I8ztVZAOxdqxtiXxOmb8yF9UCwIZ8MMCGHptU}")
class UserServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}

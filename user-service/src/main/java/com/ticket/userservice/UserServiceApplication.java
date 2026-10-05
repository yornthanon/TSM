package com.ticket.userservice;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.constant.Constant;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.repository.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Slf4j
@SpringBootApplication(scanBasePackages = {"com.ticket.userservice", "com.ticket.common"})
@EnableTransactionManagement
@EnableJpaAuditing
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(RoleRepository roleRepository) {
        return args -> {
            // Admin accounts must be created only after verified Google OAuth
            // and exact allowlist matching; never seed a password-based admin.
            ensureRole(roleRepository, "ADMIN", "Platform administrator");
            ensureRole(roleRepository, "TENANT_ADMIN", "Workspace administrator");
            ensureRole(roleRepository, "USER", "Workspace user");
        };
    }

    private Role ensureRole(RoleRepository roleRepository, String name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setCreatedBy(Constant.SYSTEM);
            role.setStatus(ApiConstant.ACTIVE.getKey());
            return roleRepository.saveAndFlush(role);
        });
    }
}

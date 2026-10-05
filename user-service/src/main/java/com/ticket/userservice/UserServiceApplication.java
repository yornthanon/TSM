package com.ticket.userservice;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.constant.Constant;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;
import java.util.UUID;

@Slf4j
@SpringBootApplication(scanBasePackages = {"com.ticket.userservice", "com.ticket.common"})
@EnableTransactionManagement
@EnableJpaAuditing
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Value("${default.admin.username:admin}")
    private String defaultAdminUsername;

    @Value("${default.admin.password:}")
    private String defaultAdminPassword;

    @Value("${default.admin.email:admin@ticketmanagement.com}")
    private String defaultAdminEmail;

    @Bean
    public CommandLineRunner commandLineRunner(RoleRepository roleRepository,
                                               UserRepository userRepository,
                                               PasswordEncoder passwordEncoder) {
        return args -> {
            Role admin = ensureRole(roleRepository, "ADMIN", "Platform administrator");
            ensureRole(roleRepository, "TENANT_ADMIN", "Workspace administrator");
            ensureRole(roleRepository, "USER", "Workspace user");

            if (!userRepository.existsByUsername(defaultAdminUsername)) {
                boolean generatedPassword = defaultAdminPassword == null || defaultAdminPassword.isBlank();
                String adminPassword = generatedPassword ? UUID.randomUUID().toString() : defaultAdminPassword;

                User adminUser = new User();
                adminUser.setUsername(defaultAdminUsername);
                adminUser.setEmail(defaultAdminEmail);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                adminUser.setStatus(Constant.ACTIVE);
                adminUser.setCreatedBy(Constant.SYSTEM);
                adminUser.setUserType(Constant.USER);
                adminUser.setLoginAttempts(0);
                adminUser.setMaxAttempts(5);
                adminUser.addRole(admin);
                userRepository.saveAndFlush(adminUser);
                log.warn("Created default admin '{}' with email '{}'; password configured: {}",
                        defaultAdminUsername, defaultAdminEmail, !generatedPassword);
            }
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

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
            Role admin = new Role();
            admin.setId(null);
            admin.setName("ADMIN");
            admin.setDescription("Administrator");
            admin.setCreatedBy(Constant.SYSTEM);
            admin.setStatus(ApiConstant.ACTIVE.getKey());

            Role user = new Role();
            user.setId(null);
            user.setName("USER");
            user.setDescription("User");
            user.setCreatedBy(Constant.SYSTEM);
            user.setStatus(ApiConstant.ACTIVE.getKey());

            List<Role> roles = List.of(admin, user);
            roles.stream()
                    .filter(role -> roleRepository.findByName(role.getName())
                            .isEmpty()).forEach(roleRepository::saveAndFlush);

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
                adminUser.addRole(admin);
                userRepository.saveAndFlush(adminUser);
                log.warn("Created default admin '{}' with email '{}'.{}",
                        defaultAdminUsername, defaultAdminEmail,
                        generatedPassword ? " Initial password: " + adminPassword
                                          : " Password configured via DEFAULT_ADMIN_PASSWORD.");
            }
        };
    }
}
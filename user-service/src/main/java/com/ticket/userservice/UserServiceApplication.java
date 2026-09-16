package com.ticket.userservice;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.constant.Constant;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

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
        };
    }
}

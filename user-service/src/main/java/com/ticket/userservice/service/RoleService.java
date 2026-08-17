package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateRoleRequestDTO;
import org.springframework.data.domain.Pageable;

public interface RoleService {
    ResponseErrorTemplate create(CreateRoleRequestDTO createRoleRequestDTO);

    ResponseErrorTemplate update(Long id, CreateRoleRequestDTO createRoleRequestDTO);

    ResponseErrorTemplate findById(Long id);

    ResponseErrorTemplate findByName(String name);

    ResponseErrorTemplate findAll(Pageable pageable);

    ResponseErrorTemplate findAllRoleActive(Pageable pageable);

    void delete(Long id);
}

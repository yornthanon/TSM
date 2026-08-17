package com.ticket.userservice.service.impl;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateRoleRequestDTO;
import com.ticket.userservice.dto.response.CreateRoleResponseDTO;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.exception.RoleValidationException;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.service.RoleService;
import com.ticket.userservice.service.handle.RoleHandlerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleHandlerService roleHandlerService;

    public RoleServiceImpl(RoleRepository roleRepository, RoleHandlerService roleHandlerService) {
        this.roleRepository = roleRepository;
        this.roleHandlerService = roleHandlerService;
    }

    @Override
    public ResponseErrorTemplate create(CreateRoleRequestDTO createRoleRequestDTO) {
        ResponseErrorTemplate validation = roleHandlerService.roleRequestValidation(createRoleRequestDTO);
        if (validation != null && validation.isError()) {
            return validation;
        }

        if (roleRepository.existsByName(createRoleRequestDTO.getName())) {
            throw new RoleValidationException("name", "Role already exists: " + createRoleRequestDTO.getName());
        }

        Role role = roleHandlerService.convertRoleRequestToRole(createRoleRequestDTO, new Role());
        roleRepository.save(role);

        return new ResponseErrorTemplate(
                "Role created successfully",
                "ROLE_CREATED",
                roleHandlerService.convertRoleToRoleResponse(role),
                false
        );
    }

    @Override
    public ResponseErrorTemplate update(Long id, CreateRoleRequestDTO createRoleRequestDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "ROLE_NOT_FOUND",
                        "Role not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));

        roleHandlerService.convertRoleRequestToRole(createRoleRequestDTO, role);
        roleRepository.save(role);

        return new ResponseErrorTemplate(
                "Role updated successfully",
                "ROLE_UPDATED",
                roleHandlerService.convertRoleToRoleResponse(role),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "ROLE_NOT_FOUND",
                        "Role not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));
        return new ResponseErrorTemplate(
                "Role retrieved successfully",
                "ROLE_FOUND",
                roleHandlerService.convertRoleToRoleResponse(role),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new BasedException(
                        "ROLE_NOT_FOUND",
                        "Role not found with name: " + name,
                        null,
                        "name",
                        name
                ));
        return new ResponseErrorTemplate(
                "Role retrieved successfully",
                "ROLE_FOUND",
                roleHandlerService.convertRoleToRoleResponse(role),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAll(Pageable pageable) {
        Page<CreateRoleResponseDTO> page = roleRepository.findAll(pageable)
                .map(roleHandlerService::convertRoleToRoleResponse);
        return new ResponseErrorTemplate(
                "Roles retrieved successfully",
                "ROLES_FOUND",
                page,
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAllRoleActive(Pageable pageable) {
        Page<CreateRoleResponseDTO> page = roleRepository.findByStatus("ACTIVE", pageable)
                .map(roleHandlerService::convertRoleToRoleResponse);
        return new ResponseErrorTemplate(
                "Active roles retrieved successfully",
                "ACTIVE_ROLES_FOUND",
                page,
                false
        );
    }

    @Override
    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "ROLE_NOT_FOUND",
                        "Role not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));
        roleRepository.delete(role);
    }
}

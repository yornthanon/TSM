package com.ticket.userservice.service.impl;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.criteria.SearchCriteria;
import com.ticket.common.criteria.SearchOperation;
import com.ticket.common.dto.request.PageableRequestVO;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.repository.BaseRepository;
import com.ticket.userservice.dto.request.RoleFilterRequest;
import com.ticket.userservice.dto.request.RoleRequest;
import com.ticket.userservice.dto.response.RoleResponse;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.exception.RoleValidationException;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.service.RoleService;
import com.ticket.userservice.service.handle.RoleHandlerService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class RoleServiceImpl implements RoleService {

   private final BaseRepository baseRepository;
   private final RoleRepository roleRepository;
   private final RoleHandlerService roleHandlerService;

   public RoleServiceImpl(BaseRepository baseRepository, RoleRepository roleRepository, RoleHandlerService roleHandlerService) {
       this.baseRepository = baseRepository;
       this.roleRepository = roleRepository;
       this.roleHandlerService = roleHandlerService;
   }

   @Override
   public ResponseErrorTemplate create(RoleRequest request) {
       ResponseErrorTemplate validation = roleHandlerService.roleRequestValidation(request);
       if (validation != null && validation.isError()) {
           return validation;
       }

       if (baseRepository.getByField("name", request.name(), Role.class) != null) {
           throw new RoleValidationException("name", "Role already exists: " + request.name());
       }

       Role role = roleHandlerService.convertRoleRequestToRole(request, new Role());
       baseRepository.saveOrUpdate(role);

       return new ResponseErrorTemplate(
               "Role created successfully",
               "ROLE_CREATED",
               roleHandlerService.convertRoleToRoleResponse(role),
               false
       );
   }

   @Override
   public ResponseErrorTemplate update(Long id, RoleRequest request) {
       Role role = baseRepository.getByField("id", id, Role.class);
       if (role == null) {
           throw new BasedException(
                   "ROLE_NOT_FOUND",
                   "Role not found with id: " + id,
                   null,
                   "id",
                   String.valueOf(id)
           );
       }

       ResponseErrorTemplate validation = roleHandlerService.roleRequestValidation(request);
       if (validation != null && validation.isError()) {
           return validation;
       }

       if (!role.getName().equals(request.name()) && baseRepository.getByField("name", request.name(), Role.class) != null) {
           throw new RoleValidationException("name", "Role already exists: " + request.name());
       }

       roleHandlerService.convertRoleRequestToRole(request, role);
       baseRepository.saveOrUpdate(role);

       return new ResponseErrorTemplate(
               "Role updated successfully",
               "ROLE_UPDATED",
               roleHandlerService.convertRoleToRoleResponse(role),
               false
       );
   }

   @Override
   public ResponseErrorTemplate findById(Long id) {
       Role role = baseRepository.getByField("id", id, Role.class);
       if (role == null) {
           throw new BasedException(
                   "ROLE_NOT_FOUND",
                   "Role not found with id: " + id,
                   null,
                   "id",
                   String.valueOf(id)
           );
       }
       return new ResponseErrorTemplate(
               "Role retrieved successfully",
               "ROLE_FOUND",
               roleHandlerService.convertRoleToRoleResponse(role),
               false
       );
   }

   @Override
   public ResponseErrorTemplate findByName(String name) {
       Role role = baseRepository.getByField("name", name, Role.class);
       if (role == null) {
           throw new BasedException(
                   "ROLE_NOT_FOUND",
                   "Role not found with name: " + name,
                   null,
                   "name",
                   name
           );
       }
       return new ResponseErrorTemplate(
               "Role retrieved successfully",
               "ROLE_FOUND",
               roleHandlerService.convertRoleToRoleResponse(role),
               false
       );
   }

   @Override
   public ResponseErrorTemplate findAll(RoleFilterRequest filterRequest) {
       BaseSearchCriteria criteria = new BaseSearchCriteria();
       boolean hasFilter = false;

       if (filterRequest.hasId()) {
           criteria.addCriteria(new SearchCriteria("id", filterRequest.getId(), SearchOperation.EQUAL));
           hasFilter = true;
       }
       if (filterRequest.hasName()) {
           criteria.addCriteria(new SearchCriteria("name", filterRequest.getName(), SearchOperation.MATCH));
           hasFilter = true;
       }
       if (filterRequest.hasStatus()) {
           criteria.addCriteria(new SearchCriteria("status", filterRequest.getStatus().toUpperCase(), SearchOperation.EQUAL));
           hasFilter = true;
       }

       PageableRequestVO pageable = PageableRequestVO.of(
               filterRequest.getPageNumber(),
               filterRequest.getPageSize(),
               filterRequest.getSortBy(),
               filterRequest.isDesc());

       PageableResponseVO<Role> page = hasFilter
               ? baseRepository.listPage(Role.class, criteria, pageable)
               : baseRepository.listPage(Role.class, pageable);

       List<RoleResponse> content = page.getContent().stream()
               .map(roleHandlerService::convertRoleToRoleResponse)
               .toList();

       PageableResponseVO<RoleResponse> response = PageableResponseVO.of(
               content,
               page.getTotalElements(),
               page.getPageNumber(),
               page.getPageSize());

       return new ResponseErrorTemplate(
               "Roles retrieved successfully",
               "ROLES_FOUND",
               response,
               false
       );
   }

   @Override
   public ResponseErrorTemplate delete(Long id) {
       Role role = baseRepository.getByField("id", id, Role.class);
       if (role == null) {
           throw new BasedException(
                   "ROLE_NOT_FOUND",
                   "Role not found with id: " + id,
                   null,
                   "id",
                   String.valueOf(id)
           );
       }
       baseRepository.delete(role);
       return new ResponseErrorTemplate(
               "Role deleted successfully",
               "ROLE_DELETED",
               null,
               false
       );
   }

   @Override
   public ResponseErrorTemplate deleteAll(Set<Long> ids) {
       if (ids == null || ids.isEmpty()) {
           return new ResponseErrorTemplate("No role ids provided", "INVALID_REQUEST", null, true);
       }

       List<Role> roles = roleRepository.findAllById(ids);
       if (roles.size() != ids.size()) {
           throw new BasedException("ROLE_NOT_FOUND", "One or more roles were not found", null, "ids", ids.toString());
       }

       baseRepository.delete(roles);
       return new ResponseErrorTemplate(
               "Roles deleted successfully",
               "ROLES_DELETED",
               null,
               false
       );
   }

   @Override
   public ResponseErrorTemplate disActivateRole(Set<Long> ids, String status) {
       if (ids == null || ids.isEmpty()) {
           return new ResponseErrorTemplate("No role ids provided", "INVALID_REQUEST", null, true);
       }
       if (!"ACTIVE".equalsIgnoreCase(status) && !"INACTIVE".equalsIgnoreCase(status)) {
           throw new BasedException("INVALID_ROLE_STATUS", "Invalid role status: " + status, null, "status", status);
       }

       List<Role> roles = roleRepository.findAllById(ids);
       if (roles.size() != ids.size()) {
           throw new BasedException("ROLE_NOT_FOUND", "One or more roles were not found", null, "ids", ids.toString());
       }

       String normalizedStatus = status.toUpperCase();
       roles.forEach(role -> role.setStatus(normalizedStatus));
       baseRepository.saveOrUpdate(roles);

       return new ResponseErrorTemplate(
               "Roles status updated successfully",
               "ROLES_STATUS_UPDATED",
               roles.stream().map(roleHandlerService::convertRoleToRoleResponse).toList(),
               false
       );
   }
}

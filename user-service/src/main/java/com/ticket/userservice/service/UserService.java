package com.ticket.userservice.service;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.dto.request.PageableRequestVO;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.entity.User;
import org.springframework.transaction.annotation.Transactional;

public interface UserService {
    ResponseErrorTemplate create(UserRequest userRequest);

    @Transactional
    ResponseErrorTemplate update(Long id, UserRequest userRequest);

    @Transactional(readOnly = true)
    ResponseErrorTemplate findById(Long id);

    @Transactional(readOnly = true)
    ResponseErrorTemplate findAll(UserFilterRequest userFilterRequest);

    ResponseErrorTemplate getStats();

    ResponseErrorTemplate activateUser(Long id);

    ResponseErrorTemplate findByUsername(String username);

    ResponseErrorTemplate findByEmail(String email);

    ResponseErrorTemplate changePassword(Long id, String oldPassword, String newPassword);

    ResponseErrorTemplate disActivateUser(Long id);

    ResponseErrorTemplate resetPassword(Long id, String newPassword);

    ResponseErrorTemplate delete(Long id);
    PageableResponseVO<User> searchUsers(UserFilterRequest userFilterRequest);

    PageableResponseVO<User> searchUseWithCriteria(BaseSearchCriteria searchCriteria , PageableRequestVO pageableRequestVO);

    @jakarta.transaction.Transactional
    PageableResponseVO<User> searchUsersWithCriteria(BaseSearchCriteria searchCriteria, PageableRequestVO pageable);
}

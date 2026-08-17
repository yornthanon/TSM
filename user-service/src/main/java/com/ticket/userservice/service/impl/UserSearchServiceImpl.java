package com.ticket.userservice.service.impl;

import com.ticket.common.dto.PageableResponseVO;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import java.util.List;

/**
 * Specification-based user search (Method 2).
 * Use: inject this service and call searchUsers(filterRequest).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSearchServiceImpl {
    private final UserRepository userRepository;

    @Transactional
    public PageableResponseVO<User> searchUsers(UserFilterRequest filterRequest) {
        try {
            Specification<User> spec = buildSpecification(filterRequest);

            Sort sort = filterRequest.hasSorting()
                    ? (filterRequest.isDesc() ? Sort.by(Sort.Direction.DESC, filterRequest.getSortBy()) : Sort.by(Sort.Direction.ASC, filterRequest.getSortBy()))
                    : Sort.unsorted();

            PageRequest pageRequest = PageRequest.of(filterRequest.getPageNumber(), filterRequest.getPageSize(), sort);
            Page<User> page = userRepository.findAll(spec, pageRequest);

            List<User> results = page.getContent();
            return PageableResponseVO.of(results, (int) page.getTotalElements(), page.getNumber(), page.getSize());
        } catch (Exception e) {
            log.error("Error searching users (specification): {}", e.getMessage(), e);
            throw e;
        }
    }

    private Specification<User> buildSpecification(UserFilterRequest filter) {
        return (root, query, cb) -> {
            Specification<User> s = Specification.where((Specification<User>) null);

            if (filter.hasNameFilter()) {
                String pattern = "%" + filter.getName().toLowerCase() + "%";
                s = s.and((r, q, c) -> c.or(
                        c.like(c.lower(r.get("firstName")), pattern),
                        c.like(c.lower(r.get("lastName")), pattern)
                ));
            }

            if (filter.hasUsernameFilter()) {
                String username = filter.getUsername().toLowerCase();
                s = s.and((r, q, c) -> c.equal(c.lower(r.get("username")), username));
            }

            if (filter.hasEmailFilter()) {
                String pattern = "%" + filter.getEmail().toLowerCase() + "%";
                s = s.and((r, q, c) -> c.like(c.lower(r.get("email")), pattern));
            }

            if (filter.hasStatusFilter()) {
                String status = filter.getStatus().toUpperCase();
                s = s.and((r, q, c) -> c.equal(c.upper(r.get("status")), status));
            }

            if (filter.hasRoleFilter()) {
                String roleValue = filter.getRole().toUpperCase();
                s = s.and((r, q, c) -> {
                    Join<User, Role> join = r.join("roles", JoinType.INNER);
                    return c.equal(c.upper(join.get("name")), roleValue);
                });
            }

            if (filter.hasDateRange()) {
                if (filter.getStartDate().isAfter(filter.getEndDate())) {
                    throw new IllegalArgumentException("Start date cannot be after end date");
                }
                s = s.and((r, q, c) -> c.between(r.get("createdAt"), filter.getStartDate(), filter.getEndDate()));
            }

            return s.toPredicate(root, query, cb);
        };
    }
}

package com.ticket.userservice.service.impl;

import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
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
            List<Predicate> predicates = new ArrayList<>();

            if (filter.hasNameFilter()) {
                String pattern = "%" + filter.getName().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                ));
            }

            if (filter.hasUsernameFilter()) {
                predicates.add(cb.equal(cb.lower(root.get("username")), filter.getUsername().toLowerCase()));
            }

            if (filter.hasEmailFilter()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + filter.getEmail().toLowerCase() + "%"));
            }

            if (filter.hasStatusFilter()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), filter.getStatus().toUpperCase()));
            }

            if (filter.hasRoleFilter()) {
                Join<User, Role> join = root.join("roles", JoinType.INNER);
                predicates.add(cb.equal(cb.upper(join.get("name")), filter.getRole().toUpperCase()));
            }

            if (filter.hasDateRange()) {
                if (filter.getStartDate().isAfter(filter.getEndDate())) {
                    throw new IllegalArgumentException("Start date cannot be after end date");
                }
                predicates.add(cb.between(root.get("createdAt"), filter.getStartDate(), filter.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

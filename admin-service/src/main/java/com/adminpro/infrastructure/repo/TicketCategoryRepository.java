package com.adminpro.infrastructure.repo;

import com.adminpro.domain.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {

    List<TicketCategory> findByNameContainingIgnoreCase(String name);

    long countByStatus(String status);
}
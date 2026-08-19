package com.adminpro.application;

import com.adminpro.domain.TicketCategory;
import com.adminpro.infrastructure.repo.TicketCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TicketCategoryService {

    private final TicketCategoryRepository repository;

    public TicketCategoryService(TicketCategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TicketCategory> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TicketCategory> search(String filter) {
        if (filter == null || filter.isBlank()) {
            return repository.findAll();
        }
        return repository.findByNameContainingIgnoreCase(filter.trim());
    }

    public TicketCategory save(TicketCategory category) {
        return repository.save(category);
    }

    public void delete(TicketCategory category) {
        repository.delete(category);
    }

    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }
}
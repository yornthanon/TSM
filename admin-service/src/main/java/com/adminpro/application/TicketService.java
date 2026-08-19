package com.adminpro.application;

import com.adminpro.domain.Ticket;
import com.adminpro.infrastructure.repo.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository repository;

    public TicketService(TicketRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Ticket> search(String filter) {
        if (filter == null || filter.isBlank()) {
            return repository.findAll();
        }
        String value = filter.trim();
        return repository.findByTicketNumberContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrRequesterNameContainingIgnoreCase(
            value,
            value,
            value
        );
    }

    public Ticket save(Ticket ticket) {
        return repository.save(ticket);
    }

    public void delete(Ticket ticket) {
        repository.delete(ticket);
    }

    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public long countByPriority(String priority) {
        return repository.countByPriority(priority);
    }

    @Transactional(readOnly = true)
    public List<Ticket> recent(int limit) {
        return repository.findAll().stream()
            .sorted((a, b) -> b.getCreatedOn().compareTo(a.getCreatedOn()))
            .limit(limit)
            .toList();
    }
}
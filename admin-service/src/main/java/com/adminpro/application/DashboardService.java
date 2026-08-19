package com.adminpro.application;

import com.adminpro.domain.DashboardStat;
import com.adminpro.domain.Ticket;
import com.adminpro.infrastructure.repo.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Provides data for the Dashboard view.
 * All stat tiles and charts are computed from live ticket queries.
 */
@Service
public class DashboardService {

    private final TicketRepository ticketRepo;

    public DashboardService(TicketRepository ticketRepo) {
        this.ticketRepo = ticketRepo;
    }

    public List<DashboardStat> getStats() {
        long open      = ticketRepo.countByStatus("NEW") + ticketRepo.countByStatus("OPEN");
        long inProgress = ticketRepo.countByStatus("IN_PROGRESS");
        long resolved  = ticketRepo.countByStatus("RESOLVED") + ticketRepo.countByStatus("CLOSED");
        long total     = ticketRepo.count();

        return List.of(
            new DashboardStat("Open Tickets",   String.valueOf(open),      "new + open",      "vaadin:envelope-open"),
            new DashboardStat("In Progress",    String.valueOf(inProgress),"being worked on", "vaadin:workplace"),
            new DashboardStat("Resolved",       String.valueOf(resolved),  "resolved + closed","vaadin:check-circle"),
            new DashboardStat("Total Tickets",  String.valueOf(total),     "all records",     "vaadin:ticket")
        );
    }

    public long countByStatus(String status) {
        return ticketRepo.countByStatus(status);
    }

    public long countByPriority(String priority) {
        return ticketRepo.countByPriority(priority);
    }

    /** Returns the most recently created tickets for the "Recent Tickets" table. */
    public List<Ticket> getRecentTickets(int limit) {
        return ticketRepo.findAll().stream()
            .sorted((a, b) -> b.getCreatedOn().compareTo(a.getCreatedOn()))
            .limit(limit)
            .toList();
    }
}
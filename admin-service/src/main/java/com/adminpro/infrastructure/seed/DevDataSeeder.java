package com.adminpro.infrastructure.seed;

import com.adminpro.domain.AnalyticsMetric;
import com.adminpro.domain.ReportConfig;
import com.adminpro.domain.Role;
import com.adminpro.domain.SupportMessage;
import com.adminpro.domain.Ticket;
import com.adminpro.domain.TicketCategory;
import com.adminpro.domain.User;
import com.adminpro.domain.UserSettings;
import com.adminpro.infrastructure.repo.AnalyticsMetricRepository;
import com.adminpro.infrastructure.repo.ReportConfigRepository;
import com.adminpro.infrastructure.repo.SupportMessageRepository;
import com.adminpro.infrastructure.repo.TicketCategoryRepository;
import com.adminpro.infrastructure.repo.TicketRepository;
import com.adminpro.infrastructure.repo.UserRepository;
import com.adminpro.infrastructure.repo.UserSettingsRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds realistic demo data into H2 on startup.
 * Guards against re-seeding so it is safe to restart the application.
 */
@Component
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final UserSettingsRepository settingsRepo;
    private final AnalyticsMetricRepository analyticsRepo;
    private final TicketCategoryRepository categoryRepo;
    private final TicketRepository ticketRepo;
    private final SupportMessageRepository messageRepo;
    private final ReportConfigRepository reportRepo;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(UserRepository userRepo,
                         UserSettingsRepository settingsRepo,
                         AnalyticsMetricRepository analyticsRepo,
                         TicketCategoryRepository categoryRepo,
                         TicketRepository ticketRepo,
                         SupportMessageRepository messageRepo,
                         ReportConfigRepository reportRepo,
                         PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.settingsRepo = settingsRepo;
        this.analyticsRepo = analyticsRepo;
        this.categoryRepo = categoryRepo;
        this.ticketRepo = ticketRepo;
        this.messageRepo = messageRepo;
        this.reportRepo = reportRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedSettings();
        seedCategories();
        seedTickets();
        seedMessages();
        seedAnalytics();
        seedReports();
    }

    // ── Agents ────────────────────────────────────────────────────────────────

    private void seedUsers() {
        if (userRepo.count() > 0) return;

        String defaultPasswordHash = passwordEncoder.encode("admin123");

        userRepo.saveAll(List.of(
            new User("Alice",   "Müller",   "alice.muller@adminpro.io",   Role.ADMIN,   true, defaultPasswordHash),
            new User("Bob",     "Johnson",  "bob.johnson@adminpro.io",    Role.MANAGER, true, defaultPasswordHash),
            new User("Carla",   "Fernández","carla.fernandez@adminpro.io",Role.MANAGER, true, defaultPasswordHash),
            new User("David",   "Kim",      "david.kim@adminpro.io",      Role.VIEWER,  true, defaultPasswordHash),
            new User("Eva",     "Schmidt",  "eva.schmidt@adminpro.io",    Role.VIEWER,  true, defaultPasswordHash),
            new User("Frank",   "Nakamura", "frank.nakamura@adminpro.io", Role.VIEWER,  true, defaultPasswordHash),
            new User("Grace",   "Okonkwo",  "grace.okonkwo@adminpro.io",  Role.MANAGER, false, defaultPasswordHash),
            new User("Henry",   "Liu",      "henry.liu@adminpro.io",      Role.VIEWER,  true, defaultPasswordHash),
            new User("Ingrid",  "Berger",   "ingrid.berger@adminpro.io",  Role.VIEWER,  false, defaultPasswordHash),
            new User("James",   "Patel",    "james.patel@adminpro.io",    Role.ADMIN,   true, defaultPasswordHash)
        ));
    }

    // ── Settings ──────────────────────────────────────────────────────────────

    private void seedSettings() {
        if (settingsRepo.count() > 0) return;
        settingsRepo.save(new UserSettings());
    }

    // ── Categories ────────────────────────────────────────────────────────────

    private void seedCategories() {
        if (categoryRepo.count() > 0) return;

        categoryRepo.saveAll(List.of(
            new TicketCategory("Technical", "Hardware, software, and connectivity issues", "ACTIVE"),
            new TicketCategory("Billing", "Invoices, payments, and subscription questions", "ACTIVE"),
            new TicketCategory("Account", "Profile, access, and password management", "ACTIVE"),
            new TicketCategory("General", "General inquiries and requests", "ACTIVE"),
            new TicketCategory("Feature Request", "New feature suggestions and ideas", "INACTIVE")
        ));
    }

    // ── Tickets ───────────────────────────────────────────────────────────────

    private void seedTickets() {
        if (ticketRepo.count() > 0) return;

        ticketRepo.saveAll(List.of(
            new Ticket("TKT-1001", "Cannot log in after password reset", "Alex Wong", "alex@techcorp.com", "Account", "HIGH", "OPEN", "Alice Müller", "Reset token expired before I could use it.", LocalDate.now()),
            new Ticket("TKT-1002", "Invoice missing line items", "Sarah Kim", "sarah@startup.co", "Billing", "MEDIUM", "IN_PROGRESS", "Bob Johnson", "The monthly invoice is missing the pro plan line.", LocalDate.now()),
            new Ticket("TKT-1003", "VPN not connecting from office", "Lior Maron", "lior@enterprise.io", "Technical", "URGENT", "OPEN", "James Patel", "All agents cannot reach the internal network since this morning.", LocalDate.now().minusDays(1)),
            new Ticket("TKT-1004", "Change billing email address", "Dani Park", "dani@mobile.dev", "Account", "LOW", "RESOLVED", "Alice Müller", "Please switch the invoice email to accounts@mobile.dev", LocalDate.now().minusDays(1)),
            new Ticket("TKT-1005", "Feature: export tickets to CSV", "Marcus Bell", "m.bell@legacy.org", "Feature Request", "MEDIUM", "NEW", null, "Would be great to export the ticket list to CSV.", LocalDate.now().minusDays(1)),
            new Ticket("TKT-1006", "Double charge on card", "Nora Ali", "nora@shop.com", "Billing", "URGENT", "OPEN", "Bob Johnson", "I was charged twice for the annual plan.", LocalDate.now().minusDays(2)),
            new Ticket("TKT-1007", "Slow dashboard loading", "Omar Hassan", "omar@analytics.io", "Technical", "MEDIUM", "IN_PROGRESS", "Carla Fernández", "Dashboard charts take over 5 seconds to load.", LocalDate.now().minusDays(2)),
            new Ticket("TKT-1008", "Update team member permissions", "Priya Patel", "priya@retail.com", "Account", "HIGH", "RESOLVED", "Alice Müller", "Please grant billing access to the finance team.", LocalDate.now().minusDays(2)),
            new Ticket("TKT-1009", "Support question about API limits", "Tomás Silva", "tomas@dev.co", "Technical", "LOW", "CLOSED", "Carla Fernández", "What is the maximum requests per minute on the standard plan?", LocalDate.now().minusDays(3)),
            new Ticket("TKT-1010", "Request refund for duplicate order", "Mei Lin", "mei@fashion.cn", "Billing", "MEDIUM", "OPEN", "James Patel", "Order #8821 was charged twice by mistake.", LocalDate.now().minusDays(3)),
            new Ticket("TKT-1011", "Enable two-factor authentication", "Kenji Sato", "kenji@games.jp", "Account", "HIGH", "NEW", null, "Please guide me on enabling 2FA on my account.", LocalDate.now().minusDays(3)),
            new Ticket("TKT-1012", "Mobile app crashes on startup", "Anna Weber", "anna@travel.de", "Technical", "URGENT", "IN_PROGRESS", "Carla Fernández", "App version 4.2 crashes immediately after launch.", LocalDate.now().minusDays(4)),
            new Ticket("TKT-1013", "Add priority flag to tickets", "Ryan Cole", "ryan@design.us", "Feature Request", "LOW", "RESOLVED", "Alice Müller", "A high-priority flag would help triage urgent issues.", LocalDate.now().minusDays(4)),
            new Ticket("TKT-1014", "Update contact phone number", "Fatima Zahra", "fatima@bank.ma", "Account", "LOW", "CLOSED", "Bob Johnson", "The contact number on the profile is outdated.", LocalDate.now().minusDays(5)),
            new Ticket("TKT-1015", "Integration with Slack broken", "Leo Martins", "leo@agency.br", "Technical", "HIGH", "OPEN", "James Patel", "Slack notifications stopped arriving this week.", LocalDate.now().minusDays(5)),
            new Ticket("TKT-1016", "Payment declined but money deducted", "Elena Popova", "elena@ecom.ru", "Billing", "URGENT", "NEW", null, "Payment says failed but the amount was deducted from my card.", LocalDate.now().minusDays(6)),
            new Ticket("TKT-1017", "Request demo of enterprise plan", "Chloe Martin", "chloe@corp.fr", "General", "MEDIUM", "RESOLVED", "Alice Müller", "We would like to see a demo of the enterprise features.", LocalDate.now().minusDays(6)),
            new Ticket("TKT-1018", "Reset password link not sending", "David Osei", "david@fintech.gh", "Account", "HIGH", "OPEN", "Bob Johnson", "The reset password email never arrives.", LocalDate.now().minusDays(7))
        ));
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    private void seedMessages() {
        if (messageRepo.count() > 0) return;

        messageRepo.saveAll(List.of(
            new SupportMessage("Sarah Kim", "sarah@startup.co", "Need account approval", "Please review my enterprise signup.", "Email", "UNREAD", LocalDateTime.now().minusMinutes(12)),
            new SupportMessage("Marcus Bell", "m.bell@legacy.org", "Payment retry request", "Card failed on renewal, can you retry?", "Chat", "OPEN", LocalDateTime.now().minusHours(2)),
            new SupportMessage("Alex Wong", "alex@techcorp.com", "Invoice copy", "Need invoice PDF for accounting.", "Email", "CLOSED", LocalDateTime.now().minusDays(1))
        ));
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    private void seedAnalytics() {
        if (analyticsRepo.count() > 0) return;

        analyticsRepo.saveAll(List.of(
            new AnalyticsMetric("Open Tickets", new BigDecimal("7"), "", "This week", "UP"),
            new AnalyticsMetric("Avg Resolution Time", new BigDecimal("4.6"), "h", "This week", "DOWN"),
            new AnalyticsMetric("First Response Time", new BigDecimal("2.1"), "h", "This week", "DOWN"),
            new AnalyticsMetric("SLA Compliance", new BigDecimal("96.4"), "%", "This month", "UP")
        ));
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    private void seedReports() {
        if (reportRepo.count() > 0) return;

        reportRepo.saveAll(List.of(
            new ReportConfig("Ticket Volume", "Alice Müller", "Weekly", "READY", LocalDate.now().minusDays(2)),
            new ReportConfig("Resolution SLA", "James Patel", "Daily", "RUNNING", LocalDate.now().minusDays(1)),
            new ReportConfig("Category Breakdown", "Bob Johnson", "Monthly", "FAILED", LocalDate.now().minusDays(3))
        ));
    }
}
package com.adminpro.ui.views.dashboard;

import com.adminpro.application.DashboardService;
import com.adminpro.domain.DashboardStat;
import com.adminpro.domain.Ticket;
import com.adminpro.ui.components.PageHeader;
import com.adminpro.ui.layout.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import jakarta.annotation.security.PermitAll;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Route(value = "", layout = MainLayout.class)
@RouteAlias(value = "dashboard", layout = MainLayout.class)
@PageTitle("Dashboard | Ticket")
@PermitAll
public class DashboardView extends Div {

    private static final DateTimeFormatter PAGE_DATE_FMT = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");
    private static final DateTimeFormatter FEED_DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private static final List<String> STATUSES = List.of("NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");
    private static final List<String> PRIORITIES = List.of("LOW", "MEDIUM", "HIGH", "URGENT");

    private final DashboardService dashboardService;

    public DashboardView(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
        addClassName("page-content");
        setWidthFull();

        PageHeader header = new PageHeader("Overview", LocalDate.now().format(PAGE_DATE_FMT));

        Button newTicket = new Button("New Ticket", VaadinIcon.PLUS.create());
        newTicket.addClassNames("btn", "btn-primary");
        newTicket.addClickListener(event -> getUI().ifPresent(ui -> ui.navigate("tickets")));

        header.addAction(newTicket);

        add(header);
        add(buildStatsRow(dashboardService.getStats()));
        add(buildDistributionRow());
        add(buildBottomRow());
    }

    private Div buildStatsRow(List<DashboardStat> stats) {
        Div row = new Div();
        row.addClassName("stats");

        for (DashboardStat stat : stats) {
            row.add(buildStat(stat.getLabel(), stat.getValue(), stat.getTrend(), "neu"));
        }

        return row;
    }

    private Div buildDistributionRow() {
        Div row = new Div();
        row.addClassNames("row", "c2");

        CardShell statusCard = buildCard("Tickets by Status", "current queue", null);
        statusCard.body().add(buildBars(statusCounts()));

        CardShell priorityCard = buildCard("Tickets by Priority", "service level", null);
        priorityCard.body().add(buildBars(priorityCounts()));

        row.add(statusCard.card(), priorityCard.card());
        return row;
    }

    private Div buildBottomRow() {
        Div row = new Div();
        row.addClassNames("row", "c64");

        Button viewAll = new Button("View all");
        viewAll.addClassNames("btn", "btn-outline", "btn-sm");
        viewAll.addClickListener(event -> getUI().ifPresent(ui -> ui.navigate("tickets")));

        CardShell recentCard = buildCard("Recent Tickets", null, viewAll);
        recentCard.body().add(buildRecentTicketsGrid());

        CardShell activityCard = buildCard("Activity", "latest tickets", null);
        activityCard.body().add(buildActivityFeed());

        row.add(recentCard.card(), activityCard.card());
        return row;
    }

    private Map<String, Long> statusCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String status : STATUSES) {
            counts.put(status, dashboardService.countByStatus(status));
        }
        return counts;
    }

    private Map<String, Long> priorityCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String priority : PRIORITIES) {
            counts.put(priority, dashboardService.countByPriority(priority));
        }
        return counts;
    }

    private Div buildBars(Map<String, Long> counts) {
        Div bars = new Div();
        bars.addClassNames("bars", "bars--interactive");

        long max = counts.values().stream().mapToLong(Long::longValue).max().orElse(1);
        if (max == 0) {
            max = 1;
        }

        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            int height = Math.max(8, (int) Math.round((entry.getValue() * 100.0) / max));

            Div col = new Div();
            col.addClassNames("bar-col", "bar-col--interactive");

            Div fill = new Div();
            fill.addClassName("bar-fill");
            fill.getStyle().set("height", height + "%");

            Span axis = new Span(entry.getKey() + " " + entry.getValue());
            axis.addClassName("bar-x");

            col.add(fill, axis);
            bars.add(col);
        }

        return bars;
    }

    private Grid<Ticket> buildRecentTicketsGrid() {
        Grid<Ticket> grid = new Grid<>(Ticket.class, false);
        grid.addClassName("table-grid");
        grid.setWidthFull();
        grid.setAllRowsVisible(true);

        grid.addColumn(Ticket::getTicketNumber).setHeader("Ticket").setAutoWidth(true).setFlexGrow(0);
        grid.addColumn(Ticket::getSubject).setHeader("Subject").setAutoWidth(true);
        grid.addColumn(Ticket::getRequesterName).setHeader("Requester").setAutoWidth(true);
        grid.addComponentColumn(ticket -> buildStatusBadge(ticket.getStatus())).setHeader("Status").setAutoWidth(true);

        grid.setItems(dashboardService.getRecentTickets(6));

        return grid;
    }

    private Div buildActivityFeed() {
        Div feed = new Div();
        feed.addClassName("feed");

        List<Ticket> recent = dashboardService.getRecentTickets(5);
        if (recent.isEmpty()) {
            Span empty = new Span("No tickets yet.");
            empty.addClassName("empty");
            feed.add(empty);
            return feed;
        }

        for (int i = 0; i < recent.size(); i++) {
            Ticket ticket = recent.get(i);

            Div item = new Div();
            item.addClassName("feed-item");

            Span dot = new Span();
            dot.addClassName("feed-dot");
            if (i < 2) {
                dot.addClassName("hi");
            }

            Div textWrap = new Div();

            Span text = new Span(ticket.getTicketNumber() + " " + ticket.getSubject());
            text.addClassName("feed-text");

            Span time = new Span(ticket.getCreatedOn().format(FEED_DATE_FMT));
            time.addClassName("feed-time");

            textWrap.add(text, time);
            item.add(dot, textWrap);
            feed.add(item);
        }

        return feed;
    }

    private Span buildStatusBadge(String status) {
        Span badge = new Span(status);
        badge.addClassName("status-pill");

        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--green");
        } else if ("IN_PROGRESS".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--amber");
        } else if ("OPEN".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--amber");
        } else {
            badge.addClassName("status-pill--gray");
        }
        return badge;
    }

    private Div buildStat(String label, String value, String delta, String tone) {
        Div stat = new Div();
        stat.addClassName("stat");

        Span labelEl = new Span(label);
        labelEl.addClassName("stat-label");

        Span valueEl = new Span(value);
        valueEl.addClassName("stat-val");

        Span deltaEl = new Span(delta);
        deltaEl.addClassNames("stat-delta", tone);

        stat.add(labelEl, valueEl, deltaEl);
        return stat;
    }

    private CardShell buildCard(String title, String hint, Button action) {
        Div card = new Div();
        card.addClassName("card");

        Div header = new Div();
        header.addClassName("card-h");

        Span titleEl = new Span(title);
        titleEl.addClassName("card-title");
        header.add(titleEl);

        if (action != null) {
            header.add(action);
        } else if (hint != null && !hint.isBlank()) {
            Span hintEl = new Span(hint);
            hintEl.addClassName("card-hint");
            header.add(hintEl);
        }

        Div body = new Div();
        body.addClassName("card-b");

        card.add(header, body);
        return new CardShell(card, body);
    }

    private record CardShell(Div card, Div body) {
    }
}
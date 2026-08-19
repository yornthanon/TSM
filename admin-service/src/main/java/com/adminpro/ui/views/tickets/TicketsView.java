package com.adminpro.ui.views.tickets;

import com.adminpro.application.TicketService;
import com.adminpro.domain.Ticket;
import com.adminpro.ui.components.PageHeader;
import com.adminpro.ui.layout.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.confirmdialog.ConfirmDialog;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.grid.GridVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.binder.BeanValidationBinder;
import com.vaadin.flow.data.binder.ValidationException;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Route(value = "tickets", layout = MainLayout.class)
@PageTitle("Tickets | Ticket")
@PermitAll
public class TicketsView extends Div {

    private static final List<String> STATUSES = List.of("NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");
    private static final List<String> PRIORITIES = List.of("LOW", "MEDIUM", "HIGH", "URGENT");
    private static final List<String> CATEGORIES = List.of("Technical", "Billing", "Account", "General", "Feature Request");
    private static final List<String> AGENTS = List.of("Alice Müller", "Bob Johnson", "Carla Fernández", "James Patel");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final TicketService ticketService;

    private final Grid<Ticket> grid = new Grid<>(Ticket.class, false);
    private final TextField searchField = new TextField();
    private final Select<String> statusFilter = new Select<>();
    private final Select<String> priorityFilter = new Select<>();

    private final Span totalValue = new Span("0");
    private final Span openValue = new Span("0");
    private final Span inProgressValue = new Span("0");

    public TicketsView(TicketService ticketService) {
        this.ticketService = ticketService;
        addClassName("page-content");
        setWidthFull();

        PageHeader header = new PageHeader("Tickets", "Track, assign, and resolve support requests");

        Button addTicketButton = new Button("New Ticket", VaadinIcon.PLUS.create());
        addTicketButton.addClassNames("btn", "btn-primary");
        addTicketButton.addClickListener(event -> openDialog(new Ticket()));

        header.addAction(addTicketButton);

        add(header);
        add(buildStats());
        add(buildToolbar());
        add(buildGridCard());

        refreshSummary();
        refreshGrid();
    }

    private Div buildStats() {
        Div stats = new Div();
        stats.addClassNames("stats", "stats--three");
        stats.add(buildStat("Total Tickets", totalValue, "all tracked records", "neu"));
        stats.add(buildStat("Open", openValue, "new + open", "up"));
        stats.add(buildStat("In Progress", inProgressValue, "being worked on", "neu"));
        return stats;
    }

    private Div buildStat(String label, Span value, String delta, String tone) {
        Div stat = new Div();
        stat.addClassName("stat");

        Span labelEl = new Span(label);
        labelEl.addClassName("stat-label");

        value.addClassName("stat-val");

        Span deltaEl = new Span(delta);
        deltaEl.addClassNames("stat-delta", tone);

        stat.add(labelEl, value, deltaEl);
        return stat;
    }

    private Div buildToolbar() {
        Div card = new Div();
        card.addClassNames("card", "toolbar-card");

        Div body = new Div();
        body.addClassNames("card-b", "toolbar-row");

        searchField.setPlaceholder("Search number, subject, or requester");
        searchField.setPrefixComponent(VaadinIcon.SEARCH.create());
        searchField.setClearButtonVisible(true);
        searchField.addClassName("toolbar-search");
        searchField.addValueChangeListener(event -> refreshGrid());

        statusFilter.setLabel("Status");
        statusFilter.setItems(concat("ALL", STATUSES));
        statusFilter.setValue("ALL");
        statusFilter.addClassName("toolbar-select");
        statusFilter.addValueChangeListener(event -> refreshGrid());

        priorityFilter.setLabel("Priority");
        priorityFilter.setItems(concat("ALL", PRIORITIES));
        priorityFilter.setValue("ALL");
        priorityFilter.addClassName("toolbar-select");
        priorityFilter.addValueChangeListener(event -> refreshGrid());

        body.add(searchField, statusFilter, priorityFilter);
        card.add(body);
        return card;
    }

    private Div buildGridCard() {
        grid.addThemeVariants(GridVariant.LUMO_NO_BORDER, GridVariant.LUMO_ROW_STRIPES);
        grid.addClassName("table-grid");
        grid.setWidthFull();

        grid.addColumn(Ticket::getTicketNumber).setHeader("Ticket").setAutoWidth(true).setFlexGrow(0);
        grid.addColumn(Ticket::getSubject).setHeader("Subject").setAutoWidth(true);
        grid.addColumn(Ticket::getRequesterName).setHeader("Requester").setAutoWidth(true);
        grid.addColumn(Ticket::getCategory).setHeader("Category").setAutoWidth(true);
        grid.addComponentColumn(ticket -> buildPriorityBadge(ticket.getPriority())).setHeader("Priority").setAutoWidth(true);
        grid.addComponentColumn(ticket -> buildStatusBadge(ticket.getStatus())).setHeader("Status").setAutoWidth(true);
        grid.addColumn(Ticket::getAssignee).setHeader("Assignee").setAutoWidth(true);
        grid.addColumn(ticket -> ticket.getCreatedOn().format(DATE_FMT)).setHeader("Created").setAutoWidth(true);
        grid.addComponentColumn(this::buildRowActions).setHeader("").setAutoWidth(true).setFlexGrow(0);

        Div card = new Div();
        card.addClassName("card");

        Div body = new Div();
        body.addClassName("card-b");
        body.add(grid);

        card.add(body);
        return card;
    }

    private Span buildPriorityBadge(String priority) {
        Span badge = new Span(priority);
        badge.addClassName("status-pill");

        if ("URGENT".equalsIgnoreCase(priority) || "HIGH".equalsIgnoreCase(priority)) {
            badge.addClassName("status-pill--red");
        } else if ("MEDIUM".equalsIgnoreCase(priority)) {
            badge.addClassName("status-pill--amber");
        } else {
            badge.addClassName("status-pill--gray");
        }
        return badge;
    }

    private Span buildStatusBadge(String status) {
        Span badge = new Span(status);
        badge.addClassName("status-pill");

        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--green");
        } else if ("OPEN".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--amber");
        } else if ("IN_PROGRESS".equalsIgnoreCase(status)) {
            badge.addClassName("status-pill--amber");
        } else {
            badge.addClassName("status-pill--gray");
        }
        return badge;
    }

    private Div buildRowActions(Ticket ticket) {
        Div actions = new Div();
        actions.addClassName("table-actions");

        Button manage = new Button("Manage");
        manage.addClassNames("btn", "btn-outline", "btn-sm");
        manage.addClickListener(event -> openDialog(ticket));

        Button delete = new Button("Delete");
        delete.addClassNames("btn", "btn-danger", "btn-sm");
        delete.addClickListener(event -> confirmDelete(ticket));

        actions.add(manage, delete);
        return actions;
    }

    private void openDialog(Ticket ticket) {
        boolean isNew = ticket.getId() == null;

        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(isNew ? "New Ticket" : "Edit Ticket");
        dialog.setWidth("620px");
        dialog.setCloseOnOutsideClick(false);

        TextField ticketNumber = new TextField("Ticket Number");
        ticketNumber.setPlaceholder("TKT-1001");
        ticketNumber.setWidthFull();

        TextField subject = new TextField("Subject");
        subject.setWidthFull();

        TextField requesterName = new TextField("Requester");
        requesterName.setWidthFull();

        TextField requesterEmail = new TextField("Requester Email");
        requesterEmail.setWidthFull();

        Select<String> category = new Select<>();
        category.setLabel("Category");
        category.setItems(CATEGORIES);
        category.setWidthFull();

        Select<String> priority = new Select<>();
        priority.setLabel("Priority");
        priority.setItems(PRIORITIES);
        priority.setWidthFull();

        Select<String> status = new Select<>();
        status.setLabel("Status");
        status.setItems(STATUSES);
        status.setWidthFull();

        Select<String> assignee = new Select<>();
        assignee.setLabel("Assignee");
        assignee.setItems(AGENTS);
        assignee.setWidthFull();

        TextArea description = new TextArea("Description");
        description.setWidthFull();

        DatePicker createdOn = new DatePicker("Created");
        createdOn.setWidthFull();

        Div form = new Div(ticketNumber, subject, requesterName, requesterEmail, category, priority, status, assignee, description, createdOn);
        form.getStyle().set("display", "grid").set("gap", "var(--lumo-space-s)");

        BeanValidationBinder<Ticket> binder = new BeanValidationBinder<>(Ticket.class);
        binder.forField(ticketNumber).asRequired().bind(Ticket::getTicketNumber, Ticket::setTicketNumber);
        binder.forField(subject).asRequired().bind(Ticket::getSubject, Ticket::setSubject);
        binder.forField(requesterName).asRequired().bind(Ticket::getRequesterName, Ticket::setRequesterName);
        binder.forField(requesterEmail).bind(Ticket::getRequesterEmail, Ticket::setRequesterEmail);
        binder.forField(category).asRequired().bind(Ticket::getCategory, Ticket::setCategory);
        binder.forField(priority).asRequired().bind(Ticket::getPriority, Ticket::setPriority);
        binder.forField(status).asRequired().bind(Ticket::getStatus, Ticket::setStatus);
        binder.forField(assignee).bind(Ticket::getAssignee, Ticket::setAssignee);
        binder.forField(description).bind(Ticket::getDescription, Ticket::setDescription);
        binder.forField(createdOn).asRequired().bind(Ticket::getCreatedOn, Ticket::setCreatedOn);
        binder.readBean(ticket);

        if (category.getValue() == null) {
            category.setValue("General");
        }
        if (priority.getValue() == null) {
            priority.setValue("MEDIUM");
        }
        if (status.getValue() == null) {
            status.setValue("NEW");
        }
        if (createdOn.getValue() == null) {
            createdOn.setValue(LocalDate.now());
        }

        Button save = new Button(isNew ? "Create" : "Save");
        save.addClassNames("btn", "btn-primary");
        save.addClickListener(event -> {
            try {
                binder.writeBean(ticket);
                ticketService.save(ticket);
                dialog.close();
                refreshSummary();
                refreshGrid();
                notify(isNew ? "Ticket created." : "Ticket updated.", NotificationVariant.LUMO_SUCCESS);
            } catch (ValidationException ex) {
                notify("Please fix the highlighted errors.", NotificationVariant.LUMO_ERROR);
            } catch (Exception ex) {
                notify("Could not save ticket. Ensure the ticket number is unique.", NotificationVariant.LUMO_ERROR);
            }
        });

        Button cancel = new Button("Cancel", event -> dialog.close());
        cancel.addClassNames("btn", "btn-outline");

        Div footer = new Div(cancel, save);
        footer.addClassName("dialog-footer");

        dialog.add(form);
        dialog.getFooter().add(footer);
        dialog.open();
    }

    private void confirmDelete(Ticket ticket) {
        ConfirmDialog confirm = new ConfirmDialog();
        confirm.setHeader("Delete ticket " + ticket.getTicketNumber() + "?");
        confirm.setText("This action cannot be undone.");
        confirm.setCancelable(true);
        confirm.setConfirmText("Delete");
        confirm.setConfirmButtonTheme("error primary");
        confirm.addConfirmListener(event -> {
            ticketService.delete(ticket);
            refreshSummary();
            refreshGrid();
            notify("Ticket deleted.", NotificationVariant.LUMO_CONTRAST);
        });
        confirm.open();
    }

    private void refreshGrid() {
        List<Ticket> tickets = ticketService.search(searchField.getValue());
        if (!"ALL".equalsIgnoreCase(statusFilter.getValue())) {
            tickets = tickets.stream()
                .filter(ticket -> statusFilter.getValue().equalsIgnoreCase(ticket.getStatus()))
                .toList();
        }
        if (!"ALL".equalsIgnoreCase(priorityFilter.getValue())) {
            tickets = tickets.stream()
                .filter(ticket -> priorityFilter.getValue().equalsIgnoreCase(ticket.getPriority()))
                .toList();
        }
        grid.setItems(tickets);
    }

    private void refreshSummary() {
        List<Ticket> tickets = ticketService.findAll();
        totalValue.setText(String.valueOf(tickets.size()));
        openValue.setText(String.valueOf(
            ticketService.countByStatus("NEW") + ticketService.countByStatus("OPEN")
        ));
        inProgressValue.setText(String.valueOf(ticketService.countByStatus("IN_PROGRESS")));
    }

    private List<String> concat(String head, List<String> items) {
        return java.util.stream.Stream.concat(java.util.stream.Stream.of(head), items.stream()).toList();
    }

    private void notify(String message, NotificationVariant variant) {
        Notification notification = Notification.show(message, 3000, Notification.Position.BOTTOM_END);
        notification.addThemeVariants(variant);
    }
}